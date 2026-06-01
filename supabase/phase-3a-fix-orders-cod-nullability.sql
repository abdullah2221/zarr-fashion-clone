-- Phase 3A: Fix checkout blocker for guest COD orders.
-- Some COD operational fields must be nullable during order creation.

alter table public.orders alter column tracking_number drop not null;
alter table public.orders alter column courier_name drop not null;
alter table public.orders alter column dispatch_date drop not null;
alter table public.orders alter column delivered_date drop not null;
alter table public.orders alter column verification_status drop not null;
