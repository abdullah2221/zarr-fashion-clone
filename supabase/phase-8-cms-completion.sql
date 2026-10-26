-- ============================================================
-- Phase 8: CMS completion — record types, engagement tables,
--          order status history trigger
-- ============================================================
-- Purpose:
--   Finish the Zeenat CMS programme (Phase 7 code package):
--     * faqs            — FAQ record type (Admin > FAQs). The FAQ
--                         page and the builder's 'faq-list' section
--                         render from these records.
--     * testimonials    — testimonial record type (Admin >
--                         Testimonials). Seeded from the quotes the
--                         homepage shows today, verbatim. No new
--                         testimonials are invented by this file.
--     * subscribers     — newsletter signups (footer + homepage
--                         band forms). Public INSERT-only: visitors
--                         can subscribe but nobody can read the list
--                         except admins.
--     * contact_messages— Contact page enquiries (Admin > Messages).
--                         Public INSERT-only, same as subscribers.
--     * order_status_history — the table scaffolded in phase-2a
--                         finally gets its writer: a trigger on
--                         orders that records every status change.
--
-- This file is ADDITIVE and IDEMPOTENT, in the style of
-- phase-7-site-pages.sql:
--   * CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
--   * Policies are dropped-if-exists then recreated, mirroring
--     supabase/rls-policies.sql ("public read active ..." +
--     "admins manage ..." via public.is_admin()).
--   * Seeds use NOT EXISTS guards keyed on the natural text, so
--     re-running never duplicates rows and never overwrites edits
--     the owner has made in the admin.
--   * The trigger is dropped-if-exists then recreated.
--
-- Seed copy is the CURRENT live copy, verbatim (the FAQ Q&As are
-- the four cards the FAQ page renders today; the testimonials are
-- the three quotes in the homepage testimonials section today).
-- Running this file must not change a single word a visitor reads.
--
-- Run: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Run it BEFORE deploying the Phase 7 code package (deploying
-- first is also safe: every new surface degrades to its Phase 6
-- behaviour until the tables exist).
-- ============================================================

-- ── FAQs ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS faqs_sort_order_idx
  ON public.faqs (sort_order);

alter table public.faqs enable row level security;

drop policy if exists "public read active faqs" on public.faqs;
drop policy if exists "admins manage faqs" on public.faqs;

create policy "public read active faqs" on public.faqs for select using (is_active);
create policy "admins manage faqs" on public.faqs for all using (public.is_admin()) with check (public.is_admin());

-- ── Testimonials ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  designation text,
  body        text not null,
  rating      integer check (rating is null or (rating >= 1 and rating <= 5)),
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx
  ON public.testimonials (sort_order);

alter table public.testimonials enable row level security;

drop policy if exists "public read active testimonials" on public.testimonials;
drop policy if exists "admins manage testimonials" on public.testimonials;

create policy "public read active testimonials" on public.testimonials for select using (is_active);
create policy "admins manage testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

-- ── Newsletter subscribers (public INSERT-only) ─────────────

CREATE TABLE IF NOT EXISTS public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "public subscribe" on public.subscribers;
drop policy if exists "admins manage subscribers" on public.subscribers;

-- Anyone may subscribe; nobody but admins may read or change the list.
create policy "public subscribe" on public.subscribers for insert with check (true);
create policy "admins manage subscribers" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());

-- ── Contact messages (public INSERT-only) ──────────────────

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  contact    text not null,
  message    text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx
  ON public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "public send contact message" on public.contact_messages;
drop policy if exists "admins manage contact messages" on public.contact_messages;

create policy "public send contact message" on public.contact_messages for insert with check (true);
create policy "admins manage contact messages" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- ── Order status history (table per phase-2a + trigger) ────
-- The table was scaffolded in phase-2a; it is recreated here
-- IF NOT EXISTS so this file is self-sufficient, with the same
-- columns: from_status is nullable (the pre-change status),
-- to_status is the new status, changed_by the acting user,
-- note the admin's status note when the update carries one.

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users(id),
  note text,
  changed_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id_changed_at
  ON public.order_status_history(order_id, changed_at desc);

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

-- The writer: on every orders.status change, record the move.
-- The admin status flow carries its note as the last entry of the
-- orderStatusHistory log embedded in shipping_address; the trigger
-- copies that note when present (shipping_address has been stored
-- both as jsonb and as JSON text over the project's life, so the
-- extraction casts through text and tolerates any shape).
create or replace function public.record_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  carried_note text := null;
  history_log jsonb := null;
begin
  if new.status is distinct from old.status then
    begin
      history_log := (new.shipping_address::text)::jsonb -> 'orderStatusHistory';
      if jsonb_typeof(history_log) = 'array' and jsonb_array_length(history_log) > 0 then
        carried_note := (history_log -> -1) ->> 'note';
      end if;
    exception when others then
      carried_note := null;
    end;

    insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, auth.uid(), carried_note);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_record_status_change on public.orders;
create trigger orders_record_status_change
after update of status on public.orders
for each row
execute function public.record_order_status_change();

-- ── Seed: FAQs (the FAQ page's current Q&As, verbatim) ──────

INSERT INTO public.faqs (question, answer, sort_order)
SELECT v.question, v.answer, v.sort_order
FROM (VALUES
  ('Do you offer Cash on Delivery?', 'Yes. Cash on Delivery availability is shown throughout the storefront and at checkout for eligible orders.', 0),
  ('How long does delivery take?', 'Use clear city-based delivery expectations and keep nationwide delivery guidance visible.', 1),
  ('Can I exchange an item?', 'Exchange eligibility depends on policy, product condition and stock availability. Link to the return/exchange policy from cart and footer.', 2),
  ('Are sale items exchangeable?', 'Sale and campaign exclusions should be clearly stated before launch to avoid customer confusion.', 3)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs f WHERE f.question = v.question);

-- ── Seed: testimonials (the homepage's current quotes, ──────
-- verbatim). The author line the site renders today combines
-- name + place ("Ayesha, Lahore"); name and designation are
-- seeded as its two parts so the rendered line is unchanged.
-- rating is seeded 5 because the template renders five stars
-- for every quote today; the column stays nullable so future
-- records can carry no rating.

INSERT INTO public.testimonials (name, designation, body, rating, sort_order)
SELECT v.name, v.designation, v.body, v.rating, v.sort_order
FROM (VALUES
  ('Ayesha', 'Lahore', '“The Eid suit arrived beautifully packed and exactly like the photos. COD made ordering easy.”', 5, 0),
  ('Maham', 'Islamabad', '“Fast delivery to Islamabad and the fabric quality felt premium for the price.”', 5, 1),
  ('Sana', 'Karachi', '“The lawn edit is easy to browse on mobile. I found sizes and offers quickly.”', 5, 2)
) AS v(name, designation, body, rating, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials t WHERE t.name = v.name AND t.body = v.body);
