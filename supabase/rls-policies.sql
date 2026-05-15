alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.feedback enable row level security;
alter table public.banners enable row level security;
alter table public.campaigns enable row level security;
alter table public.admin_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create policy "public can read active products" on public.products for select using (is_active);
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "public can read active categories" on public.categories for select using (is_active);
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public can read product images" on public.product_images for select using (true);
create policy "admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "users read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "users update own profile except role" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "users create own orders" on public.orders for insert with check (user_id = auth.uid());
create policy "users read own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "users create items for own orders" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid())
);
create policy "users read items for own orders" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_id and (orders.user_id = auth.uid() or public.is_admin()))
);
create policy "admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "users manage own wishlist" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "public read approved feedback" on public.feedback for select using (status = 'approved' or public.is_admin());
create policy "users submit own feedback" on public.feedback for insert with check (user_id = auth.uid() or user_id is null);
create policy "admins moderate feedback" on public.feedback for update using (public.is_admin()) with check (public.is_admin());

create policy "public read active banners" on public.banners for select using (is_active);
create policy "admins manage banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy "public read active campaigns" on public.campaigns for select using (is_active);
create policy "admins manage campaigns" on public.campaigns for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.admin_settings for all using (public.is_admin()) with check (public.is_admin());
