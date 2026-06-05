-- ============================================================
-- schema.sql — UR-Fashion Supabase schema (idempotent)
-- ============================================================
-- Safe to re-run at any time on an existing database.
-- Uses IF NOT EXISTS / DO $$ guards throughout so nothing
-- is dropped and no error is thrown when objects already exist.
-- ============================================================

-- ── Enum Types ───────────────────────────────────────────────
-- PostgreSQL has no CREATE TYPE IF NOT EXISTS, so we use a
-- DO block to check pg_type before creating each enum.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending', 'confirmed', 'packed', 'processing',
      'shipped', 'delivered', 'cancelled', 'returned'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE public.feedback_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  phone      text,
  role       public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_path  text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id             uuid primary key default gen_random_uuid(),
  legacy_id      integer not null unique,
  sku            text not null unique,
  name           text not null,
  slug           text not null unique,
  brand          text,
  description    text,
  price          numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2) check (original_price is null or original_price >= price),
  category_id    uuid references public.categories(id) on delete set null,
  is_active      boolean not null default true,
  is_featured    boolean not null default false,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  -- storage_path accepts either a Supabase Storage path (e.g. products/1/main.jpg)
  -- or a full https:// remote URL for placeholder/CDN images.
  -- The Angular app detects the scheme and routes accordingly.
  storage_path text not null,
  alt_text     text,
  is_primary   boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- Unique index: only one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS one_primary_image_per_product
  ON public.product_images(product_id)
  WHERE is_primary;

CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id),   -- nullable for guest orders
  order_number     text unique,
  status           public.order_status not null default 'pending',
  subtotal         numeric(12,2) not null check (subtotal >= 0),
  shipping_amount  numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total_amount     numeric(12,2) not null check (total_amount >= 0),
  currency         text not null default 'PKR',
  payment_method   text,
  customer_name    text,
  customer_phone   text,
  customer_email   text,
  shipping_address text,
  city             text,
  province         text,
  tracking_number  text,
  courier_name     text,
  dispatch_date    timestamptz,
  delivered_date   timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  sku          text,
  unit_price   numeric(12,2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  line_total   numeric(12,2) not null check (line_total >= 0),
  size         text,
  color        text,
  created_at   timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  order_id       uuid references public.orders(id) on delete set null,
  product_id     uuid references public.products(id) on delete set null,
  rating         integer check (rating between 1 and 5),
  message        text not null,
  customer_name  text,
  customer_email text,
  status         public.feedback_status not null default 'pending',
  approved_by    uuid references auth.users(id),
  approved_at    timestamptz,
  created_at     timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  subtitle   text,
  image_path text,
  target_url text,
  starts_at  timestamptz,
  ends_at    timestamptz,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- ── Column additions for existing deployments ─────────────────
-- These ALTER TABLE ... ADD COLUMN IF NOT EXISTS statements
-- safely add any columns that the original schema.sql may have
-- omitted but that later phase migrations depend on.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number     text,
  ADD COLUMN IF NOT EXISTS payment_method   text,
  ADD COLUMN IF NOT EXISTS customer_name    text,
  ADD COLUMN IF NOT EXISTS customer_phone   text,
  ADD COLUMN IF NOT EXISTS customer_email   text,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS city             text,
  ADD COLUMN IF NOT EXISTS province         text,
  ADD COLUMN IF NOT EXISTS tracking_number  text,
  ADD COLUMN IF NOT EXISTS courier_name     text,
  ADD COLUMN IF NOT EXISTS dispatch_date    timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_date   timestamptz;

-- Unique index on order_number (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'orders' AND indexname = 'orders_order_number_key'
  ) THEN
    CREATE UNIQUE INDEX orders_order_number_key ON public.orders(order_number)
      WHERE order_number IS NOT NULL;
  END IF;
END $$;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS size  text,
  ADD COLUMN IF NOT EXISTS color text;

-- Make orders.user_id nullable for guest checkout (if it was NOT NULL before)
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;
