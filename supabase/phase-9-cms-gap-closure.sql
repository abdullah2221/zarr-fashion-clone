-- ============================================================
-- Phase 9 — CMS gap closure (Phase 8 code package)
-- Run: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Run it BEFORE deploying the Phase 8 code package (deploying
-- first is also safe: every new surface degrades to its Phase 7
-- behaviour until the tables exist).
--
-- This file is ADDITIVE and IDEMPOTENT, in the style of
-- phase-7-site-pages.sql and phase-8-cms-completion.sql:
--   * CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
--   * Policies are dropped-if-exists then recreated, mirroring
--     supabase/rls-policies.sql ("public read active ..." +
--     "admins manage ..." via public.is_admin()).
--   * Seeds use NOT EXISTS guards keyed on the natural text, so
--     re-running never duplicates rows and never overwrites edits
--     the owner has made in the admin.
--
-- Contents:
--   * brands        — brand record type (Admin > Brands). The homepage
--                     brands strip reads these records once they exist;
--                     until then it keeps rendering the page-section
--                     payload brands, so running this file changes
--                     nothing a visitor reads. Seeded from the strip's
--                     current wordmarks, verbatim.
--   * admin_activity— append-only admin audit trail (Admin > Activity).
--                     Admin-only: no public policy at all.
-- ============================================================

-- ── Brands ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  style_key  text not null default '',
  link_url   text,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS brands_sort_order_idx
  ON public.brands (sort_order);

alter table public.brands enable row level security;

drop policy if exists "public read active brands" on public.brands;
drop policy if exists "admins manage brands" on public.brands;

create policy "public read active brands" on public.brands for select using (is_active);
create policy "admins manage brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());

-- Seeds: the homepage strip's current wordmarks, verbatim, in order.
-- Guarded on name, so re-runs never duplicate and never overwrite.
INSERT INTO public.brands (name, style_key, sort_order)
SELECT name, style_key, sort_order FROM (VALUES
  ('SAHAR', 'sahar', 0),
  ('Neeshay', 'neeshay', 1),
  ('BURAQ', 'buraq', 2),
  ('YARDS', 'yards', 3),
  ('AZURE', 'azure', 4),
  ('SADAF FAWAD KHAN', 'sadaf', 5),
  ('Nainah', 'nainah', 6),
  ('KOEL', 'koel', 7),
  ('naya dour', 'naya-dour', 8),
  ('MUSHQ', 'mushq', 9)
) AS seed(name, style_key, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.brands b WHERE b.name = seed.name);

-- ── Storefront settings: public read of the one public row ──────────
-- PROVEN GAP (26 Oct 2026): admin_settings had admin-only policies, so
-- visitors — and the SSR server, which uses the same anonymous key —
-- could never read the storefront_settings row. Every Settings edit
-- (store name, contact, menus, badges) was invisible to visitors, who
-- always saw the code defaults instead — including the placeholder
-- phone 0320 0000000 and the dead eid-edit/wedding menu links. This
-- policy makes ONLY the storefront_settings row public. That row is
-- public-facing content by design (name, contact, menus, badges); any
-- other admin_settings key stays admin-only.
drop policy if exists "public read storefront settings" on public.admin_settings;
create policy "public read storefront settings" on public.admin_settings
  for select using (key = 'storefront_settings');

-- ── Admin activity log ──────────────────────────────────────────────
-- Append-only audit trail (Admin > Activity). Admin-only: there is
-- deliberately NO public policy, so visitors can never read it. The
-- admin UI has no delete button for log rows — deleting history
-- would defeat the audit. Writes are best-effort from the admin
-- services: a failed log insert never fails the admin action itself.
CREATE TABLE IF NOT EXISTS public.admin_activity (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  entity_label text,
  detail       text,
  created_at   timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS admin_activity_created_at_idx
  ON public.admin_activity (created_at DESC);

alter table public.admin_activity enable row level security;

drop policy if exists "admins manage activity" on public.admin_activity;

create policy "admins manage activity" on public.admin_activity
  for all using (public.is_admin()) with check (public.is_admin());
