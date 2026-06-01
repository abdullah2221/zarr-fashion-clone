-- Phase 3: Guest checkout RPC for atomic order creation.
-- Run after Phase 2 migration recommendations if possible.

-- Allow guest orders by making user_id nullable (non-breaking for existing rows).
alter table public.orders
  alter column user_id drop not null;

-- Guest insert policy for direct inserts (optional; RPC is preferred).
drop policy if exists "guest create orders" on public.orders;
create policy "guest create orders"
on public.orders
for insert
with check (user_id is null);

-- Guest order_items create policy (optional; RPC is preferred).
drop policy if exists "guest create order items" on public.order_items;
create policy "guest create order items"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id is null
  )
);

create or replace function public.create_guest_order(payload jsonb)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_items jsonb;
  v_item jsonb;
begin
  if payload is null then
    raise exception 'payload is required';
  end if;

  v_items := coalesce(payload->'items', '[]'::jsonb);
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'at least one item is required';
  end if;

  v_order_number := coalesce(
    payload->>'order_number',
    'URF-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4))
  );

  insert into public.orders (
    user_id,
    status,
    subtotal,
    shipping_amount,
    total_amount,
    currency,
    shipping_address,
    notes,
    order_number,
    customer_name,
    customer_phone,
    customer_email,
    city,
    province,
    payment_method,
    verification_status,
    created_at,
    updated_at
  )
  values (
    null,
    coalesce(payload->>'status', 'pending')::public.order_status,
    coalesce((payload->>'subtotal')::numeric, 0),
    coalesce((payload->>'shipping_amount')::numeric, 0),
    coalesce((payload->>'total_amount')::numeric, 0),
    coalesce(payload->>'currency', 'PKR'),
    jsonb_build_object(
      'orderNumber', v_order_number,
      'customerName', payload->>'customer_name',
      'customerPhone', payload->>'customer_phone',
      'customerEmail', payload->>'customer_email',
      'address', payload->>'shipping_address',
      'city', payload->>'city',
      'province', payload->>'province',
      'paymentMethod', coalesce(payload->>'payment_method', 'cod'),
      'verificationStatus', 'pending'
    ),
    nullif(payload->>'notes', ''),
    v_order_number,
    payload->>'customer_name',
    payload->>'customer_phone',
    nullif(payload->>'customer_email', ''),
    payload->>'city',
    payload->>'province',
    coalesce(payload->>'payment_method', 'cod'),
    'pending',
    now(),
    now()
  )
  returning id into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(v_items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      unit_price,
      quantity,
      line_total,
      size,
      color,
      created_at
    )
    values (
      v_order_id,
      nullif(v_item->>'product_id', '')::uuid,
      coalesce(v_item->>'product_name', 'Product'),
      nullif(v_item->>'sku', ''),
      coalesce((v_item->>'unit_price')::numeric, 0),
      greatest(coalesce((v_item->>'quantity')::integer, 1), 1),
      coalesce((v_item->>'line_total')::numeric, 0),
      nullif(v_item->>'size', ''),
      nullif(v_item->>'color', ''),
      now()
    );
  end loop;

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.create_guest_order(jsonb) to anon, authenticated;
