create type public.user_role as enum ('customer', 'admin', 'super_admin');
create type public.order_status as enum ('pending', 'confirmed', 'packed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
create type public.feedback_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer not null unique,
  sku text not null unique,
  name text not null,
  slug text not null unique,
  brand text,
  description text,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2) check (original_price is null or original_price >= price),
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index one_primary_image_per_product on public.product_images(product_id) where is_primary;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status public.order_status not null default 'pending',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency text not null default 'PKR',
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  rating integer check (rating between 1 and 5),
  message text not null,
  customer_name text,
  customer_email text,
  status public.feedback_status not null default 'pending',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text,
  target_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
