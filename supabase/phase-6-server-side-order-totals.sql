-- ============================================================
-- Phase 6: Server-side order totals (checkout amount integrity)
-- ============================================================
-- Problem (found in the final launch audit):
--   * public.create_guest_order(jsonb) inserted subtotal, shipping,
--     total and every item's unit_price / line_total verbatim from the
--     caller's payload, and accepted caller-supplied status and
--     order_number. Anyone could place a guest order for Rs 1.
--   * Phase 3 also left direct INSERT policies on orders/order_items
--     ("guest create orders", "guest create order items"), so the RPC
--     could be bypassed entirely through the REST API.
--   * Signed-in checkout inserted orders + items directly from the
--     browser with client-calculated amounts.
--
-- Fix (this file, additive and reversible):
--   1. All order money is recomputed here, from the products table.
--      Payload money fields (unit_price, line_total, subtotal,
--      shipping_amount, total_amount), status, payment fields and
--      order_number are IGNORED if sent.
--   2. Delivery is computed from trusted configuration:
--      admin_settings 'storefront_settings' -> freeDeliveryThreshold
--      (default 4999) and deliveryFee (default 0 — the fee the store
--      charges below the threshold; 0 preserves the store's current
--      live behaviour of free delivery until the owner sets a fee in
--      admin settings; the server, never the client, applies it).
--   3. Initial status is forced to 'pending'; payment method 'cod';
--      the order number is generated here in the existing format
--      URF-YYYYMMDD-XXXX with a uniqueness check.
--   4. A matching create_customer_order(jsonb) covers signed-in
--      checkout; it takes the user id from auth.uid() only.
--   5. The four direct INSERT policies on orders / order_items are
--      dropped, so these SECURITY DEFINER functions are the ONLY way
--      to create orders. All SELECT / admin policies are untouched.
--
-- Rollback: re-run supabase/phase-3-checkout-guest-rpc.sql (restores
-- the old function) and re-create the dropped insert policies from
-- supabase/rls-policies.sql / phase-3 (exact statements in the audit
-- report). No table data is changed by this migration.
--
-- Apply AFTER phases 2a-5. Run in the Supabase SQL Editor or with
-- `supabase db execute`. Test in staging first.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Helper: trusted delivery fee for a given subtotal.
-- Internal only: never callable through the API.
-- ------------------------------------------------------------
create or replace function public.checkout_delivery_fee(p_subtotal numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb;
  v_threshold_raw text;
  v_fee_raw text;
  v_threshold numeric := 4999;
  v_fee numeric := 0;
begin
  select value into v_settings
  from public.admin_settings
  where key = 'storefront_settings';

  if v_settings is not null then
    v_threshold_raw := v_settings ->> 'freeDeliveryThreshold';
    v_fee_raw := v_settings ->> 'deliveryFee';

    if v_threshold_raw ~ '^\d+(\.\d+)?$' then
      v_threshold := v_threshold_raw::numeric;
    end if;
    if v_fee_raw ~ '^\d+(\.\d+)?$' then
      v_fee := v_fee_raw::numeric;
    end if;
  end if;

  if p_subtotal >= v_threshold then
    return 0;
  end if;
  return round(v_fee, 2);
end;
$$;

revoke all on function public.checkout_delivery_fee(numeric) from public, anon, authenticated;

-- ------------------------------------------------------------
-- Internal order builder shared by guest and customer checkout.
-- Prices come ONLY from public.products. Internal only.
-- ------------------------------------------------------------
create or replace function public.checkout_create_order(payload jsonb, p_user_id uuid)
returns table (
  order_id uuid,
  order_number text,
  subtotal numeric,
  shipping_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_item jsonb;
  v_product_id_raw text;
  v_product_id uuid;
  v_quantity_raw text;
  v_quantity integer;
  v_product record;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_attempt integer := 0;
  v_customer_name text := nullif(btrim(coalesce(payload ->> 'customer_name', '')), '');
  v_customer_phone text := nullif(btrim(coalesce(payload ->> 'customer_phone', '')), '');
  v_shipping_address text := nullif(btrim(coalesce(payload ->> 'shipping_address', '')), '');
begin
  if payload is null then
    raise exception 'payload is required';
  end if;

  if v_customer_name is null then
    raise exception 'customer_name is required';
  end if;
  if v_customer_phone is null then
    raise exception 'customer_phone is required';
  end if;
  if v_shipping_address is null then
    raise exception 'shipping_address is required';
  end if;

  v_items := coalesce(payload -> 'items', '[]'::jsonb);
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'at least one item is required';
  end if;
  if jsonb_array_length(v_items) > 50 then
    raise exception 'too many items in one order';
  end if;

  -- Validate every line against the trusted catalogue first.
  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_product_id_raw := v_item ->> 'product_id';
    if v_product_id_raw is null
       or v_product_id_raw !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
      raise exception 'A product in your cart is no longer available.';
    end if;
    v_product_id := v_product_id_raw::uuid;

    v_quantity_raw := v_item ->> 'quantity';
    if v_quantity_raw is null or v_quantity_raw !~ '^\d+$' then
      raise exception 'Invalid quantity in your cart.';
    end if;
    v_quantity := v_quantity_raw::integer;
    if v_quantity < 1 or v_quantity > 20 then
      raise exception 'Invalid quantity in your cart.';
    end if;

    select id, name, sku, price, is_active
      into v_product
      from public.products
      where id = v_product_id;

    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if not v_product.is_active then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if v_product.price is null or v_product.price <= 0 then
      raise exception 'A product in your cart has an invalid price.';
    end if;

    v_line_total := round(v_product.price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_subtotal := round(v_subtotal, 2);
  v_shipping := public.checkout_delivery_fee(v_subtotal);
  v_total := round(v_subtotal + v_shipping, 2);

  -- Server-generated order number, existing format, uniqueness-checked.
  loop
    v_attempt := v_attempt + 1;
    v_order_number := 'URF-' || to_char(now(), 'YYYYMMDD') || '-'
      || upper(substr(md5(random()::text || clock_timestamp()::text || v_attempt::text), 1, 4));
    exit when not exists (select 1 from public.orders where orders.order_number = v_order_number);
    if v_attempt >= 10 then
      raise exception 'could not generate a unique order number, please retry';
    end if;
  end loop;

  insert into public.orders (
    user_id, status, subtotal, shipping_amount, total_amount, currency,
    shipping_address, notes, order_number,
    customer_name, customer_phone, customer_email, city, province,
    payment_method, verification_status, created_at, updated_at
  )
  values (
    p_user_id,
    'pending',
    v_subtotal,
    v_shipping,
    v_total,
    'PKR',
    jsonb_build_object(
      'orderNumber', v_order_number,
      'customerName', v_customer_name,
      'customerPhone', v_customer_phone,
      'customerEmail', nullif(payload ->> 'customer_email', ''),
      'address', v_shipping_address,
      'city', payload ->> 'city',
      'province', payload ->> 'province',
      'paymentMethod', 'cod',
      'verificationStatus', 'pending'
    ),
    nullif(payload ->> 'notes', ''),
    v_order_number,
    v_customer_name,
    v_customer_phone,
    nullif(payload ->> 'customer_email', ''),
    payload ->> 'city',
    payload ->> 'province',
    'cod',
    'pending',
    now(),
    now()
  )
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    select name, sku, price
      into v_product
      from public.products
      where id = v_product_id;

    insert into public.order_items (
      order_id, product_id, product_name, sku,
      unit_price, quantity, line_total, size, color, created_at
    )
    values (
      v_order_id,
      v_product_id,
      v_product.name,
      v_product.sku,
      v_product.price,
      v_quantity,
      round(v_product.price * v_quantity, 2),
      nullif(v_item ->> 'size', ''),
      nullif(v_item ->> 'color', ''),
      now()
    );
  end loop;

  return query
  select v_order_id, v_order_number, v_subtotal, v_shipping, v_total;
end;
$$;

revoke all on function public.checkout_create_order(jsonb, uuid) from public, anon, authenticated;

-- ------------------------------------------------------------
-- Guest checkout. The old definition returns fewer columns, so it
-- must be dropped before it can be recreated with server totals.
-- ------------------------------------------------------------
drop function if exists public.create_guest_order(jsonb);

create function public.create_guest_order(payload jsonb)
returns table (
  order_id uuid,
  order_number text,
  subtotal numeric,
  shipping_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.checkout_create_order(payload, null::uuid);
end;
$$;

revoke all on function public.create_guest_order(jsonb) from public;
grant execute on function public.create_guest_order(jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- Signed-in customer checkout. The user id comes from the session
-- (auth.uid()) and can never be supplied by the caller.
-- ------------------------------------------------------------
create or replace function public.create_customer_order(payload jsonb)
returns table (
  order_id uuid,
  order_number text,
  subtotal numeric,
  shipping_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  return query select * from public.checkout_create_order(payload, v_uid);
end;
$$;

revoke all on function public.create_customer_order(jsonb) from public, anon;
grant execute on function public.create_customer_order(jsonb) to authenticated;

-- ------------------------------------------------------------
-- Close the direct-insert bypasses. From now on orders can only be
-- created through the two functions above (which run as definer and
-- compute every amount). Read policies and admin management
-- policies are deliberately NOT touched.
-- ------------------------------------------------------------
drop policy if exists "guest create orders" on public.orders;
drop policy if exists "guest create order items" on public.order_items;
drop policy if exists "users create own orders" on public.orders;
drop policy if exists "users create items for own orders" on public.order_items;

commit;

-- PostgREST: pick up the new function signature immediately.
notify pgrst, 'reload schema';
