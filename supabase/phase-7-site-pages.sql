-- ============================================================
-- Phase 7: Site pages + page sections (page-builder CMS)
-- ============================================================
-- Purpose:
--   Move every remaining hardcoded content block of the storefront
--   into database records the owner can edit from Admin > Pages,
--   following the page-builder model: a page is an ordered list of
--   typed section instances (section_type + content payload +
--   sort_order + is_active). Card-level content keeps its existing
--   record systems (banners, campaigns, products, categories,
--   settings); sections own page composition and the content of
--   blocks no other system owns (static page copy, testimonials,
--   brands/stats band, newsletter, sale carousel side banner).
--
-- This file is ADDITIVE and IDEMPOTENT:
--   * CREATE TABLE IF NOT EXISTS for both tables.
--   * Policies are dropped-if-exists then recreated, mirroring the
--     conventions of supabase/rls-policies.sql ("public read active
--     ..." + "admins manage ..." via public.is_admin()).
--   * Seeds use ON CONFLICT / NOT EXISTS guards, so re-running the
--     file never duplicates pages or sections and never overwrites
--     edits the owner has already made in the admin.
--
-- Seed copy is the CURRENT live copy, verbatim. Running this file
-- must not change a single word a visitor reads.
--
-- Run: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Run it BEFORE (or immediately after) deploying the Phase 6 code
-- package. Until it runs, the storefront renders its built-in
-- default homepage composition and the static pages show their
-- neutral "content coming soon" safety state.
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.page_sections (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references public.site_pages(id) on delete cascade,
  section_type text not null,
  content      jsonb not null default '{}'::jsonb,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS page_sections_page_order_idx
  ON public.page_sections (page_id, sort_order);

-- ── Row level security (mirrors banners/campaigns) ─────────

alter table public.site_pages enable row level security;
alter table public.page_sections enable row level security;

drop policy if exists "public read active pages" on public.site_pages;
drop policy if exists "admins manage pages" on public.site_pages;
drop policy if exists "public read active sections" on public.page_sections;
drop policy if exists "admins manage sections" on public.page_sections;

create policy "public read active pages" on public.site_pages for select using (is_active);
create policy "admins manage pages" on public.site_pages for all using (public.is_admin()) with check (public.is_admin());
create policy "public read active sections" on public.page_sections for select using (is_active);
create policy "admins manage sections" on public.page_sections for all using (public.is_admin()) with check (public.is_admin());

-- ── Seed: pages (current titles, verbatim) ──────────────────

INSERT INTO public.site_pages (slug, title) VALUES
  ('home', 'Home'),
  ('contact', 'Contact Zeenat'),
  ('about', 'About Zeenat'),
  ('faq', 'Frequently Asked Questions'),
  ('privacy-policy', 'Privacy Policy'),
  ('terms-conditions', 'Terms & Conditions'),
  ('return-exchange-policy', 'Return / Exchange Policy')
ON CONFLICT (slug) DO NOTHING;

-- ── Seed: homepage sections (current order + copy, verbatim) ─
-- Section types whose content lives in another system (hero ->
-- banners, category-scroll -> categories, featured-collections /
-- campaign-band / offers / campaign-cards -> campaigns,
-- carousels -> products, pulse-marquee / trust-strip /
-- collection-tags / support-band -> store settings) carry an
-- empty payload: the row controls presence, order and visibility
-- only.

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'hero', '{}'::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'hero' AND s.sort_order = 10);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'pulse-marquee', '{}'::jsonb, 20 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'pulse-marquee' AND s.sort_order = 20);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'trust-strip', '{}'::jsonb, 30 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'trust-strip' AND s.sort_order = 30);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'collection-tags', '{}'::jsonb, 40 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'collection-tags' AND s.sort_order = 40);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'category-scroll', '{}'::jsonb, 50 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'category-scroll' AND s.sort_order = 50);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'featured-collections', '{}'::jsonb, 60 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'featured-collections' AND s.sort_order = 60);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'campaign-band', '{}'::jsonb, 70 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'campaign-band' AND s.sort_order = 70);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'carousel-popular', '{}'::jsonb, 80 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'carousel-popular' AND s.sort_order = 80);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'carousel-sale', $json${"sideBannerTitle": "Shop the Sale For Her", "sideBannerText": "Your favorite looks, now at can't-miss prices — shop chic pieces before they're gone!"}$json$::jsonb, 90 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'carousel-sale' AND s.sort_order = 90);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'testimonials', $json${"eyebrow": "Loved by shoppers", "title": "Premium fashion with the trust Pakistani customers expect.", "items": [{"quote": "“The Eid suit arrived beautifully packed and exactly like the photos. COD made ordering easy.”", "author": "Ayesha, Lahore"}, {"quote": "“Fast delivery to Islamabad and the fabric quality felt premium for the price.”", "author": "Maham, Islamabad"}, {"quote": "“The lawn edit is easy to browse on mobile. I found sizes and offers quickly.”", "author": "Sana, Karachi"}]}$json$::jsonb, 100 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'testimonials' AND s.sort_order = 100);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'brands-stats', $json${"brands": [{"name": "SAHAR", "styleKey": "sahar"}, {"name": "Neeshay", "styleKey": "neeshay"}, {"name": "BURAQ", "styleKey": "buraq"}, {"name": "YARDS", "styleKey": "yards"}, {"name": "AZURE", "styleKey": "azure"}, {"name": "SADAF FAWAD KHAN", "styleKey": "sadaf"}, {"name": "Nainah", "styleKey": "nainah"}, {"name": "KOEL", "styleKey": "koel"}, {"name": "naya dour", "styleKey": "naya-dour"}, {"name": "MUSHQ", "styleKey": "mushq"}], "statsEyebrow": "BUY OVER", "statsItems": [{"value": "50,000+", "label": "PRODUCTS"}], "statsBackgroundPath": "sections/stats-band-bg.jpg", "statsBackgroundAlt": "Draped ivory and gold embroidered fabrics in a warm atelier"}$json$::jsonb, 110 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'brands-stats' AND s.sort_order = 110);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'offers', '{}'::jsonb, 120 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'offers' AND s.sort_order = 120);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'campaign-cards', '{}'::jsonb, 130 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'campaign-cards' AND s.sort_order = 130);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'support-band', '{}'::jsonb, 140 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'support-band' AND s.sort_order = 140);

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'newsletter', $json${"eyebrow": "First access", "heading": "Get Eid drops, lawn launches and sale alerts first.", "emailPlaceholder": "Enter your email address", "buttonText": "Notify Me", "note": "No clutter. Just curated Zeenat updates for new arrivals, COD offers and seasonal campaigns."}$json$::jsonb, 150 FROM public.site_pages p
WHERE p.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'newsletter' AND s.sort_order = 150);

-- ── Seed: static pages (current copy, verbatim) ─────────────
-- One 'static-content' section per page. Title lives on the
-- site_pages row; the payload carries the rest of the content
-- the static-page template renders.

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Customer care", "intro": "Support should be easy to find, especially for COD, exchange and delivery questions.", "icon": "support_agent", "formType": "contact", "sections": [{"icon": "call", "title": "Phone & WhatsApp", "body": "Message Zeenat on WhatsApp for order, delivery and exchange support during business hours."}, {"icon": "mail", "title": "Email support", "body": "Use support@ur-fashion.pk for order, return and partnership inquiries."}, {"icon": "schedule", "title": "Support hours", "body": "Confirm launch support hours once operations are finalized, then keep them consistent across contact surfaces."}], "secondary": [{"label": "WhatsApp", "value": "Chat support available"}, {"label": "Email", "value": "support@ur-fashion.pk"}, {"label": "Location", "value": "Pakistan-wide online store"}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'contact'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Our story", "intro": "Zeenat is positioned as a premium Pakistani fashion storefront for seasonal wardrobes, festive dressing and everyday confidence.", "icon": "auto_awesome", "sections": [{"icon": "style", "title": "Premium fashion curation", "body": "A focused edit of lawn, unstitched suits, ready-to-wear, wedding looks and accessories."}, {"icon": "verified", "title": "Trust-first shopping", "body": "Clear delivery, COD and exchange messaging helps reduce friction for online fashion buyers."}, {"icon": "public", "title": "Made for Pakistan", "body": "Campaigns reflect Eid, Ramadan, summer lawn, winter arrivals, weddings and 14 August moments."}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'about'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Help center", "intro": "Answers to common shopping, delivery, COD and exchange questions.", "icon": "quiz", "sections": [{"title": "Do you offer Cash on Delivery?", "body": "Yes. Cash on Delivery availability is shown throughout the storefront and at checkout for eligible orders."}, {"title": "How long does delivery take?", "body": "Use clear city-based delivery expectations and keep nationwide delivery guidance visible."}, {"title": "Can I exchange an item?", "body": "Exchange eligibility depends on policy, product condition and stock availability. Link to the return/exchange policy from cart and footer."}, {"title": "Are sale items exchangeable?", "body": "Sale and campaign exclusions should be clearly stated before launch to avoid customer confusion."}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'faq'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Legal", "intro": "Explain how Zeenat collects, uses and protects customer data for orders, delivery and support.", "icon": "policy", "sections": [{"title": "Information collected", "body": "Name, phone, email, address, order details and browsing interactions needed for e-commerce operations."}, {"title": "How it is used", "body": "To process orders, provide support, improve shopping experience and send opted-in marketing updates."}, {"title": "Customer control", "body": "Customers should be able to request updates, deletion or unsubscribe from marketing communications."}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'privacy-policy'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Legal", "intro": "Set expectations for product availability, pricing, campaigns, checkout, delivery and use of the website.", "icon": "gavel", "sections": [{"title": "Pricing and availability", "body": "Prices, stock and promotional offers may change. Campaign terms should be visible on sale banners."}, {"title": "Orders", "body": "Orders are subject to confirmation, payment method validation and delivery coverage."}, {"title": "Website use", "body": "Content, images and brand assets should not be reused without permission."}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'terms-conditions'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');

INSERT INTO public.page_sections (page_id, section_type, content, sort_order)
SELECT p.id, 'static-content', $json${"eyebrow": "Shopping support", "intro": "Clear exchange guidance improves confidence for online fashion buyers, especially for size and fabric concerns.", "icon": "autorenew", "sections": [{"icon": "inventory_2", "title": "Eligibility", "body": "Items should be unused, unworn, with tags and packaging intact. Final policy windows need business confirmation."}, {"icon": "sell", "title": "Sale items", "body": "Campaign and sale exclusions should be shown clearly on product and cart pages before checkout."}, {"icon": "support_agent", "title": "How to request", "body": "Customers should contact support with order number, product photos and reason for exchange."}]}$json$::jsonb, 10 FROM public.site_pages p
WHERE p.slug = 'return-exchange-policy'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections s WHERE s.page_id = p.id AND s.section_type = 'static-content');
