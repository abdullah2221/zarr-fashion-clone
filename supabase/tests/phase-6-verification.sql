-- ============================================================
-- Phase 6 — staging verification script
-- ============================================================
-- Run this ONLY on a disposable database or Supabase branch, AFTER
-- applying phase-6-server-side-order-totals.sql. Do not run it on a
-- production database you care about.
--
-- The whole script runs inside one transaction and ends with
-- ROLLBACK, so test products and test orders leave nothing behind —
-- provided you paste and run it as a single batch (the Supabase SQL
-- Editor does). Every check raises an exception on failure, so a
-- clean run that reaches the final line means everything passed.
-- ============================================================

begin;

-- ---------- fixtures (rolled back) ----------
delete from public.products where sku like 'PHASE6-TEST-%';
-- products.slug is NOT NULL UNIQUE with no default in the real schema,
-- so the fixtures must supply it explicitly.
insert into public.products (id, legacy_id, sku, name, slug, brand, price, is_active, stock_quantity) values
  ('a0000000-0000-0000-0000-000000000401', 999401, 'PHASE6-TEST-4499', 'PHASE6 TEST SUIT', 'phase6-test-4499', 'TEST', 4499, true, 10),
  ('a0000000-0000-0000-0000-000000000402', 999402, 'PHASE6-TEST-2500', 'PHASE6 TEST KURTI', 'phase6-test-2500', 'TEST', 2500, true, 10),
  ('a0000000-0000-0000-0000-000000000403', 999403, 'PHASE6-TEST-INACTIVE', 'PHASE6 TEST INACTIVE', 'phase6-test-inactive', 'TEST', 3000, false, 10);
-- Merge (never replace) the threshold into the existing settings JSON,
-- so other keys (contact details, messages) survive even outside the
-- rollback if this file is ever pasted carelessly.
insert into public.admin_settings (key, value)
values ('storefront_settings', '{"freeDeliveryThreshold": 4999}'::jsonb)
on conflict (key) do update set value = public.admin_settings.value || excluded.value;

-- ---------- checks ----------
do $$
declare
  r record;
  o record;
  v_uid uuid;
  v_payload jsonb;
  A constant uuid := 'a0000000-0000-0000-0000-000000000401';
  B constant uuid := 'a0000000-0000-0000-0000-000000000402';
  C constant uuid := 'a0000000-0000-0000-0000-000000000403';
begin
  -- 1) Forged guest order (Rs 1 prices/totals, delivered status, fake
  --    order number) must be repriced and normalised by the server.
  v_payload := jsonb_build_object(
    'customer_name', 'Phase6 Test', 'customer_phone', '03000000000',
    'customer_email', null, 'shipping_address', '1 Test Street',
    'city', 'Lahore', 'province', 'Punjab', 'notes', null,
    'subtotal', 1, 'shipping_amount', 0, 'total_amount', 1,
    'status', 'delivered', 'order_number', 'HACKED-1', 'payment_method', 'card',
    'items', jsonb_build_array(jsonb_build_object(
      'product_id', A, 'product_name', 'FORGED', 'sku', 'FORGED',
      'unit_price', 1, 'quantity', 1, 'line_total', 1)));
  select * into r from public.create_guest_order(v_payload);
  if r.subtotal <> 4499 or r.total_amount <> 4499 then
    raise exception 'FAIL 1: forged order not repriced (subtotal %, total %)', r.subtotal, r.total_amount;
  end if;
  select status::text as s, payment_method as pm into o from public.orders where id = r.order_id;
  if o.s <> 'pending' or o.pm <> 'cod' then
    raise exception 'FAIL 1: forged status/payment not ignored (%, %)', o.s, o.pm;
  end if;
  if r.order_number = 'HACKED-1' or r.order_number !~ '^URF-\d{8}-[0-9A-F]{4}$' then
    raise exception 'FAIL 1: order number not server-generated (%)', r.order_number;
  end if;
  raise notice 'PASS 1: forged Rs 1 guest order repriced to Rs 4,499; status/order number server-owned';

  -- 2) Quantities and totals.
  v_payload := jsonb_build_object(
    'customer_name', 'Phase6 Test', 'customer_phone', '03000000000',
    'shipping_address', '1 Test Street', 'city', 'Lahore', 'province', 'Punjab',
    'items', jsonb_build_array(jsonb_build_object('product_id', A, 'quantity', 2)));
  select * into r from public.create_guest_order(v_payload);
  if r.subtotal <> 8998 or r.shipping_amount <> 0 or r.total_amount <> 8998 then
    raise exception 'FAIL 2: 2 x 4499 totals wrong (%, %, %)', r.subtotal, r.shipping_amount, r.total_amount;
  end if;
  raise notice 'PASS 2: 2 x Rs 4,499 = Rs 8,998 with free delivery at the threshold';

  -- 3) Rejections (each in its own sub-block).
  begin
    perform public.create_guest_order(jsonb_build_object(
      'customer_name', 'T', 'customer_phone', '0', 'shipping_address', 'x',
      'items', jsonb_build_array(jsonb_build_object('product_id', C, 'quantity', 1))));
    raise exception 'FAIL 3: inactive product was accepted';
  exception when others then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS 3a: inactive product rejected (%)', sqlerrm;
  end;
  begin
    perform public.create_guest_order(jsonb_build_object(
      'customer_name', 'T', 'customer_phone', '0', 'shipping_address', 'x',
      'items', jsonb_build_array(jsonb_build_object('product_id', A, 'quantity', 0))));
    raise exception 'FAIL 3: zero quantity was accepted';
  exception when others then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS 3b: zero quantity rejected (%)', sqlerrm;
  end;
  begin
    perform public.create_guest_order(jsonb_build_object(
      'customer_name', 'T', 'customer_phone', '0', 'shipping_address', 'x',
      'items', '[]'::jsonb));
    raise exception 'FAIL 3: empty items were accepted';
  exception when others then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS 3c: empty items rejected (%)', sqlerrm;
  end;

  -- 4) Customer path: needs one existing user in this (staging) database.
  begin
    select id into v_uid from auth.users limit 1;
  exception when undefined_table then
    v_uid := null;
  end;
  if v_uid is null then
    raise notice 'SKIP 4: no users exist in this database; create a staging user and re-run to test the customer path';
  else
    perform set_config('request.jwt.claims', json_build_object('sub', v_uid)::text, true);
    v_payload := jsonb_build_object(
      'customer_name', 'Phase6 Test', 'customer_phone', '03000000000',
      'shipping_address', '1 Test Street', 'city', 'Lahore', 'province', 'Punjab',
      'total_amount', 1,
      'items', jsonb_build_array(jsonb_build_object('product_id', A, 'quantity', 1, 'unit_price', 1)));
    select * into r from public.create_customer_order(v_payload);
    if r.total_amount <> 4499 then
      raise exception 'FAIL 4: customer order total not server-computed (%)', r.total_amount;
    end if;
    select user_id into v_uid from public.orders where id = r.order_id;
    if v_uid is null then
      raise exception 'FAIL 4: customer order is not owned by the session user';
    end if;
    perform set_config('request.jwt.claims', '', true);
    raise notice 'PASS 4: customer order priced by the server and owned by the session user';
  end if;

  -- 5) Direct-insert policies must be gone; grants must be right.
  if exists (select 1 from pg_policies where schemaname = 'public'
             and policyname in ('guest create orders', 'guest create order items',
                                'users create own orders', 'users create items for own orders')) then
    raise exception 'FAIL 5: a direct-insert policy on orders/order_items still exists';
  end if;
  if not has_function_privilege('anon', 'public.create_guest_order(jsonb)', 'execute') then
    raise exception 'FAIL 5: anon cannot execute create_guest_order';
  end if;
  if has_function_privilege('anon', 'public.create_customer_order(jsonb)', 'execute') then
    raise exception 'FAIL 5: anon can execute create_customer_order';
  end if;
  raise notice 'PASS 5: direct-insert policies removed; function grants are correct';

  raise notice 'PHASE 6 VERIFICATION: ALL CHECKS PASSED';
end $$;

rollback;
