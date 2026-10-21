-- Zeenat Phase 2A: Admin Orders Management schema recommendations
-- Non-breaking strategy: additive changes only, no destructive operations.
-- Run in a controlled environment and regenerate TS database types afterward.

-- 1) Extend order status enum for full admin workflow coverage.
do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.order_status'::regtype
      and enumlabel = 'packed'
  ) then
    alter type public.order_status add value 'packed' after 'confirmed';
  end if;
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.order_status'::regtype
      and enumlabel = 'returned'
  ) then
    alter type public.order_status add value 'returned' after 'delivered';
  end if;
exception when duplicate_object then null;
end $$;

-- 2) Add normalized operational columns for orders.
alter table public.orders
  add column if not exists order_number text unique,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists payment_method text default 'cod',
  add column if not exists verification_status text,
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists dispatch_date date,
  add column if not exists delivered_date date;

create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_customer_phone on public.orders(customer_phone);
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);
create index if not exists idx_orders_city on public.orders(city);

-- 3) Add variant detail fields to order items (for immutable order snapshot).
alter table public.order_items
  add column if not exists size text,
  add column if not exists color text;

-- 4) Optional: backfill normalized columns from existing shipping_address JSON.
update public.orders
set
  order_number = coalesce(order_number, shipping_address->>'orderNumber'),
  customer_name = coalesce(customer_name, shipping_address->>'customerName'),
  customer_phone = coalesce(customer_phone, shipping_address->>'customerPhone'),
  customer_email = coalesce(customer_email, shipping_address->>'customerEmail'),
  city = coalesce(city, shipping_address->>'city'),
  province = coalesce(province, shipping_address->>'province'),
  payment_method = coalesce(payment_method, shipping_address->>'paymentMethod', 'cod'),
  verification_status = coalesce(verification_status, shipping_address->>'verificationStatus'),
  courier_name = coalesce(courier_name, shipping_address->>'courierName'),
  tracking_number = coalesce(tracking_number, shipping_address->>'trackingNumber')
where shipping_address is not null;

-- 5) Optional: order status history table for auditable workflow tracking.
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users(id),
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id_changed_at
  on public.order_status_history(order_id, changed_at desc);

-- 6) RLS for status history.
alter table public.order_status_history enable row level security;

drop policy if exists "admins manage order status history" on public.order_status_history;
drop policy if exists "users read own order status history" on public.order_status_history;

create policy "admins manage order status history"
on public.order_status_history
for all
using (public.is_admin())
with check (public.is_admin());

create policy "users read own order status history"
on public.order_status_history
for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_status_history.order_id
      and orders.user_id = auth.uid()
  ) or public.is_admin()
);
