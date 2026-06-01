-- Phase 5: Public-safe order tracking RPC
-- Allows lookup by order number + phone without exposing private customer details.

drop function if exists public.track_order_public(text, text);

create function public.track_order_public(
  lookup_order_number text,
  lookup_phone text
)
returns table (
  order_number text,
  status text,
  payment_method text,
  city text,
  province text,
  total_amount numeric,
  tracking_number text,
  courier_name text,
  dispatch_date date,
  delivered_date date,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(lookup_phone, ''), '\D', '', 'g');
begin
  if coalesce(trim(lookup_order_number), '') = '' then
    return;
  end if;

  if normalized_phone = '' then
    return;
  end if;

  return query
  select
    o.order_number::text,
    o.status::text,
    o.payment_method::text,
    o.city::text,
    o.province::text,
    o.total_amount::numeric,
    o.tracking_number::text,
    o.courier_name::text,
    o.dispatch_date::date,
    o.delivered_date::date,
    o.created_at::timestamptz
  from public.orders o
  where o.order_number = trim(lookup_order_number)
    and regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g') = normalized_phone
  limit 1;
end;
$$;

revoke all on function public.track_order_public(text, text) from public;
grant execute on function public.track_order_public(text, text) to anon, authenticated;
