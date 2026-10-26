# v7 (22 Oct 2026) — CMS COMPLETION: FAQ + TESTIMONIAL RECORDS, MENU BUILDER, MEDIA LIBRARY, CUSTOMERS, SUBSCRIBERS, MESSAGES, ORDER HISTORY

**Deploy v7 INSTEAD of v6.1. Unzip FULLY into a NEW folder and deploy
from there (`npx vercel --prod`). This package CONTAINS the v6.1
routing fix (vercel.json ordered routes — unchanged), the v6 page
builder, the v5 SSR fix, and the v3/v4 fixes. No Vercel setting
changes.**

**ONE DATABASE STEP (required): run `supabase/phase-8-cms-completion.sql`
in Supabase Dashboard -> SQL Editor -> Run BEFORE deploying v7.**
It creates four new tables (`faqs`, `testimonials`, `subscribers`,
`contact_messages`), makes sure `order_status_history` exists, adds a
trigger that records every order status change, and seeds the FAQs
and testimonials with the site's current copy, word for word. It is
safe to re-run (it never overwrites your later admin edits). If you
deploy first and run it after, nothing breaks: until it runs, the
FAQ page and homepage testimonials keep showing the existing copy,
and the newsletter/contact forms simply report an error if used.

What v7 changes:

1. **FAQs and testimonials are records now** (new Admin > FAQs and
   Admin > Testimonials). The FAQ page reads its questions from the
   `faqs` table; a new "FAQ list" block can also be placed on any
   page in Admin > Pages. The homepage testimonials section reads
   the `testimonials` table and hides itself when no testimonial is
   active.
2. **Menu builder (Admin > Settings > Navigation menus).** Header
   menu, mobile menu and footer link columns are editable and
   reorderable, stored in the existing settings.
3. **New admin screens:** Media (read-only library of the
   product-images bucket with public-URL copy), Customers (profiles
   list; role changes via the existing set_user_role function,
   super admin only), Subscribers (newsletter signups), Messages
   (contact-form inbox with a mark-handled toggle).
4. **Working forms:** the footer and homepage newsletter forms now
   subscribe for real (with already-subscribed and error states);
   the Contact page form saves enquiries to the Messages inbox.
5. **Page builder grows:** a "Custom content" block (heading, body,
   optional image + button) for any page, and an optional item
   `limit` on list sections (categories, featured collections, both
   carousels, offers, campaign cards, FAQ list).
6. **Dashboard + orders:** the dashboard shows real revenue
   (all orders except cancelled), the order count and the latest 5
   orders; the order detail page shows the status-history timeline
   recorded by the new trigger.
7. **Account page:** customers can now change their password as
   well as edit their name and phone.

Rollback: redeploy zeenat-phase6.1.zip — the phase-8 tables can stay
in place; v6.1 ignores them.

# v6.1 (22 Oct 2026) — routing fix ONLY: vercel.json now uses ordered routes so the homepage "/" is served by the SSR function instead of the static shell (Vercel was serving dist/app/browser/index.html for "/" before the rewrite could fire; every other route already SSRs). Deploy v6.1 instead of v6. If anything looks wrong, redeploy zeenat-phase6.zip to restore the previous behaviour exactly.

# Deployment notes — Phase 3: real SSR on Vercel + admin spacing (prepared 21 Oct 2026)

## ⚠️ v6 — 22 Oct 2026 (this package; supersedes v5) — DYNAMIC CMS: PAGE BUILDER, FEATURED VIA CAMPAIGNS, TRUTHFUL FALLBACKS REMOVED

**Deploy exactly the same way as v5: unzip FULLY into a NEW folder and
deploy from there (`npx vercel --prod`). This package CONTAINS the v5
SSR fix (and the v3 scroll fix and both v4 fixes), so deploy v6
INSTEAD of v5 if v5 is not live yet. No Vercel setting changes.**

**ONE DATABASE STEP (new): run `supabase/phase-7-site-pages.sql` in
Supabase Dashboard -> SQL Editor -> Run — ideally BEFORE deploying
v6.** It creates two new tables (`site_pages`, `page_sections`) and
seeds them with the site's current copy, word for word. It is safe to
re-run (it never overwrites your later edits). If you deploy first and
run it after, nothing breaks: until it runs, the homepage renders its
built-in default layout and the info pages (About, Contact, FAQ,
Privacy, Terms, Returns) show a neutral "Content coming soon" note
instead of their copy.

What v6 changes:

1. **Page builder (new Admin > Pages).** The homepage is now an
   ordered list of section blocks stored in the database — reorder
   them (sort order), hide them (visibility toggle), and edit the
   blocks that carry their own text (testimonials, brands + stats
   band, newsletter, sale carousel side banner, and every static
   page's content). Card content stays where it already lives:
   banners, campaigns, products, categories and Settings — each
   section in the Pages editor says which screen owns its content.
2. **Featured Collections is CMS-driven** (Admin > Campaigns,
   placement "Featured collections"): title, subtitle (the small
   label), image, link, sort order, active — the same flow as the
   hero banners. No tiles in the CMS -> the section is hidden; there
   is no hardcoded fallback any more. **After deploying, create the
   4 approved tiles** (checklist in PHASE-6-RESULTS.md) — upload the
   approved files from `sections-fix/upload/featured-1..4`.
3. **Stats band + brands are editable** in Admin > Pages (the
   "Brands + stats band" section of the Home page): background image
   and alt text, the stat value/label pairs, and the brand wordmark
   list. The current values were carried over exactly as-is —
   including the "50,000+ PRODUCTS" line, which is unchanged and
   remains your decision.
4. **All invented fallbacks removed (truthful content).** The offers
   grid, the homepage campaign cards, and the shop banner band no
   longer substitute hardcoded promotions when the campaigns table
   has none — those sections simply render nothing until you create
   real campaigns. The shop page's sidebar likewise no longer shows
   an invented "Summer Lawn Live" headline. The hero's built-in
   fallback slides (only seen if the banners table were ever empty)
   no longer carry a "Flat 30% Off" tag. The mobile menu's sale link
   now reads "Sale", matching the desktop nav.
5. **Mobile guard:** offer cards get a dark background at <=767px so
   a failed campaign image can never produce white-on-white text.


## ⚠️ v5 — 22 Oct 2026 (this package; supersedes v4) — SSR ON VERCEL FIXED

One fix on top of v4, in one file (`src/server.ts`) — **deploy exactly the
same way as v4: unzip FULLY into a NEW folder and deploy from there
(`npx vercel --prod`). Do not mix files from the v4 and v5 packages. No
Vercel setting changes are needed — the fix is entirely in the code.**

**Symptom:** production (v3/v4 code) answered every route 200, but with the
empty 3,341-byte client shell — no server-rendered content, no
`ng-server-context="ssr"` marker — even though the same build renders full
SSR when run locally and the Express function was clearly in the path.

**Root cause (proven by local experiment, see `PHASE-5-RESULTS.md`):**
@angular/ssr "deopts" a request to client-side rendering whenever it
carries an `x-forwarded-*` header that is not on its trusted-proxy list —
a fail-safe for requests arriving through an unconfigured proxy. The
default trust list contains only `x-forwarded-host` and
`x-forwarded-proto`. **Vercel's edge always adds `x-forwarded-for` and
`x-forwarded-port`**, so on Vercel 100% of requests deopted and the engine
served `index.csr.html` for every route. Local runs send no such headers,
which is why local proof always showed SSR.

**Fix:** the `AngularNodeAppEngine` in `src/server.ts` now declares
`trustProxyHeaders: ['x-forwarded-for', 'x-forwarded-host',
'x-forwarded-port', 'x-forwarded-proto', 'x-forwarded-prefix']` — the five
standard forwarding headers Vercel's edge sets. **The SSRF host allowlist
is unchanged and still enforced** (an unknown Host or X-Forwarded-Host
still returns 400 — verified).

**Proof (Vercel-style invocation of `api/index.js` locally, with the exact
header set Vercel's edge sends):** before the fix, `/`, `/shop` and
`/product/12` all returned the 3,341-byte shell; after the fix they return
full SSR (161 KB / 54.7 KB / 44.7 KB, SSR marker present, real product
content — e.g. the /product/12 title "SANA SAFINAZ UNSTITCHED MAHAY LAWN
3 PIECE SUIT"), static files serve byte-identical, and the framework's
`trustProxyHeaders` warnings are gone from the log. Production build PASS,
vitest 7/7. Nothing else differs from v4: `supabase/`, `package.json` and
`pnpm-lock.yaml` are byte-identical to the v4 package. Full evidence:
`PHASE-5-RESULTS.md` (delivered alongside this package).

**After deploying:** hard-refresh a product page and use "View source" —
you should see the full rendered HTML (product names, prices) instead of
the near-empty shell, and Google-indexable SSR content on every route.

## ⚠️ v4 — 22 Oct 2026 (this package; supersedes v3)

Two small fixes on top of v3 — **deploy exactly the same way as v3: unzip
FULLY into a NEW folder and deploy from there (`npx vercel --prod`). Do not
mix files from the v3 and v4 packages.**

1. **Mobile hero crop** (`src/app/components/hero/hero.component.scss`, CSS
   only): on portrait phones the hero image is centre-cropped to a narrow
   band of the 16:9 banner, which cut the subject (composed on the right of
   all three current banners) out of the frame — phones showed mostly empty
   wall. Inside the existing `max-width: 767px` mobile range the image now
   uses `object-position: 78% center`, shifting the visible band onto the
   subject. Desktop rendering is **unchanged** — the rule lives entirely
   inside the mobile media query, and before/after desktop renders are
   pixel-identical (proof in `PHASE-4-RESULTS.md`).
2. **Admin banner uploader** (`src/app/admin/services/admin-campaigns.service.ts`,
   one expression): creating a banner uploaded its image to the fixed path
   `banners/new.jpg`, so every new banner overwrote the previous banner's
   image and all banner records ended up showing the same picture. A create
   now uploads to `banners/<random-uuid>.<ext>` — unique per banner.
   Editing an existing banner is unchanged (still `banners/<record-id>.<ext>`).
   The three existing banners were already repaired separately (their images
   live at `banners/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`); v4 just stops
   the bug from recurring.

**What v4 does NOT fix:** SSR rendering on Vercel — production still serves
the client-rendered app shell (the open v3 diagnosis). v4 does not attempt
it; that remains a separate item. Nothing else differs from v3:
`supabase/`, `package.json` and `pnpm-lock.yaml` are byte-identical to the
v3 package. Verified: production build PASS, vitest 7/7. Full evidence:
`PHASE-4-RESULTS.md` (delivered alongside this package).

## ⚠️ v3 — 22 Oct 2026 (this package; supersedes v2)

One further fix on top of v2, in one file (`src/app/app.config.ts`): the
router now uses `withInMemoryScrolling({ scrollPositionRestoration: 'top',
anchorScrolling: 'enabled' })`. Before this, the app had no scroll handling
at all, so in-app navigation kept the previous page's scroll position —
tapping a product low on the shop page opened its (long) detail page at the
bottom instead of the top. With v3, every newly opened page starts at the
top and the browser Back button still restores the earlier position.
Verified: production build PASS, vitest 7/7, SSR host checks from the v2
section re-run green (production host /shop and /product/12 → 200 SSR).

Deployment itself needs owner approval. **Nothing in this package changes the
live site until you deploy it, and production stays on the Phase 2 static
setup until every preview check below passes.**

## ⚠️ v2 fix — 22 Oct 2026 (READ FIRST; this supersedes the v1 package)

**What the v1 package did wrong in production:** v1 was deployed to
production on 22 Oct and every app route (`/shop`, `/product/12`, `/login`,
`/cart`, `/admin`, …) returned **HTTP 400** with the plain-text body
`Header "host" with value "zarr-fashion-clone.vercel.app" is not allowed.`
(Static files and the homepage shell still served 200.) Root cause:
@angular/ssr validates the `Host`/`X-Forwarded-Host` header of every request
against an allowlist (an SSRF guard), and the generated app-engine manifest
only allows `localhost`/`127.0.0.1`. The v1 local proof used a localhost
Host, so the defect was invisible locally — the preview host check that
would have caught it never ran.

**What changed in v2 (one file, `src/server.ts`):** the `AngularNodeAppEngine`
is now constructed with an `allowedHosts` option — @angular/ssr's own
configuration mechanism — listing `zarr-fashion-clone.vercel.app` exactly,
`*.vercel.app` (the engine treats a `*.` entry as a domain-suffix match,
which covers every Vercel preview/deployment URL of this project), plus the
hostname of `APP_URL` when that variable is set (so a future custom domain
needs only the env var). `localhost`/`127.0.0.1` remain allowed via the
build manifest, and the `NG_ALLOWED_HOSTS` env var still overrides the list
at runtime. The guard itself is **not** disabled: an unrelated Host is still
rejected with 400 (verified locally). Full evidence: `PHASE-3-V2-FIX.md`.

**Rules for v2 — stricter than v1:**
1. **Production must be rolled back to the last Phase 2 deployment NOW**
   (Vercel → Deployments → the Phase 2 production deployment → ⋯ →
   Instant Rollback) and must stay on Phase 2 until the v2 PREVIEW passes
   every check in the preview section below — including the preview-host
   and production-host checks that v1 skipped.
2. Deploy v2 to a **Preview** deployment only. Never deploy it straight to
   production.
3. Do not mix files from the v1 and v2 packages; v2 replaces v1 completely.

## What is wrong today (recap)
Production serves only the static browser output (`dist/app/browser`) with a
`vercel.json` that rewrites everything to `/index.csr.html` — a 3.3 KB empty
app shell. The Angular SSR server (`dist/app/server/server.mjs`) is built on
every build but never runs anywhere, so every page is client-rendered and
hydrates slowly, and view-source shows no real content to search engines.

## What this package changes (deployment config only)
| File | Change |
|---|---|
| `vercel.json` (root) | SPA rewrite to `/index.csr.html` removed. Now: Angular framework preset, `installCommand: pnpm install`, `buildCommand: pnpm build`, `outputDirectory: dist/app/browser` (static files), one rewrite of everything else to `/api/index`, and a `functions` entry that bundles `dist/app/**` into that function. |
| `public/vercel.json` | Same content, kept in sync with the root file exactly as the Phase 2 package did. (In a full-project deployment Vercel reads only the root file; the copy exists for consistency with the previous packages.) |
| `api/index.js` | NEW. The Vercel Serverless Function bridge. Vercel does not run Angular's `server.mjs` by itself; this handler imports the `reqHandler` that `src/server.ts` exports and passes each request to the Angular SSR engine. The server bundle serves the browser statics itself and renders all other routes on the server. |

How a request flows after this deploy: real files in `dist/app/browser`
(JS/CSS chunks, `runtime-config.js`, images, `sitemap.xml`, `robots.txt`) are
served directly by Vercel's static layer; every other path is rewritten to
the `api/index` function, which returns server-rendered HTML.

The only other code change in this package is admin-only SCSS spacing
(dashboard + admin shell). No `supabase/` file, no dependency, no checkout or
order logic, and no environment value is changed.

## Before you deploy — environment variables (important)
The build bakes `public/runtime-config.js` from the environment **at build
time** (the `prebuild` script), and the SSR server also reads the project
environment at runtime. In Vercel → Settings → Environment Variables make
sure these three exist for **both Preview and Production** (today they may
only be scoped to Production — a Preview deployment without them gets an
empty runtime config and the catalogue cannot load):

- `SUPABASE_URL` — the project URL (already set for Production; check Preview too)
- `SUPABASE_ANON_KEY` — the publishable key (same)
- `APP_URL=https://zarr-fashion-clone.vercel.app` (or the future custom domain)

Do not change the values themselves — only confirm the Preview scope is enabled.

## Step 1 — Deploy a PREVIEW of the FULL project
Deploy this package as a **full project**, not as the browser folder:

- **Git route (preferred):** put this tree in the repo on a non-production
  branch and push; Vercel builds a Preview deployment for the branch.
- **CLI route:** from the root of this package (the folder containing
  `vercel.json`, `package.json` and `api/`), run `vercel` (not
  `vercel --prod`) and follow the prompts, linking to the existing project.

Do **not** upload `dist/app/browser` as the site root this time — that was
the Phase 2 static method, and this package's `vercel.json` points at an
`/api` function that only exists in a full-project build. In the Vercel
build log, confirm the build ran `pnpm build` and finished with
"Application bundle generation complete", and that a Function named
`api/index` was created.

## Step 2 — Preview checks (ALL must pass before promoting)
On the preview URL (call it $PREVIEW):

1. `GET $PREVIEW/` → HTTP 200, and the HTML is **far larger than 3,341
   bytes** (local reference build: ~161 KB). View-source shows real rendered
   text — product names such as "PRINTED MAXI DRESS", prices such as
   "Rs. 4,499", "Add to" buttons — and the marker `ng-server-context="ssr"`
   is present. It must NOT be the bare `index.csr.html` shell.
2. `GET $PREVIEW/shop` → HTTP 200, `ng-server-context="ssr"` present, **and
   real product names (e.g. "PRINTED MAXI DRESS", "UNSTITCHED MAHAY") appear
   in the raw HTML.** This check is a hard gate: in the local sandbox run
   the shop page rendered its frame server-side but the product cards were
   not in the HTML, because the sandbox machine cannot reach Supabase
   reliably from the server process. On Vercel the function can reach
   Supabase, so the cards must be there. If they are not, stop — do not
   promote — and keep production on Phase 2 while this is investigated.
3. `GET $PREVIEW/product/12` → HTTP 200; the `<title>` contains
   "UNSTITCHED MAHAY LAWN 3 PIECE SUIT" and the body HTML contains the
   product price/description text (same hard gate as check 2).
4. `GET $PREVIEW/runtime-config.js` → JavaScript containing the real
   `SUPABASE_URL` and `APP_URL` (not empty, not `localhost`) — proves the
   Preview environment variables from the section above are in place.
5. Static files still win over the rewrite: open one JS chunk URL from the
   homepage's page source — it returns JavaScript, not HTML. `/sitemap.xml`
   and `/robots.txt` return their files.
6. Click-through on the preview: home → shop → a product → add to cart →
   cart; open `/admin` and confirm the login screen appears. (Navigation
   only — test orders are a separate approval, as before.)
7. No platform 404s: `/category/lawn`, `/track-order`, `/cart`, `/login`
   all return 200 HTML.

If any check fails, the preview can simply be abandoned — production has
not been touched.

## Step 3 — Promote to production
Promote the **same verified build**: merge the branch into the production
branch (Git route) or run `vercel --prod` from the same tree (CLI route).
Then re-run checks 1–5 against `https://zarr-fashion-clone.vercel.app`
(check 2 and 3 included — do not skip them on production).

## Rollback
- Before promotion there is nothing to roll back: production is still the
  Phase 2 static deployment.
- After promotion, rollback = redeploy the **Phase 2 package**
  (`zeenat-phase2-readiness.zip`) with its original static method (browser
  output at the project root, its own `vercel.json` rewriting to
  `/index.csr.html`), or in the Vercel dashboard open Deployments, pick the
  last Phase 2 production deployment and choose "Promote to Production"
  (instant rollback to that exact build).
- Never mix the two: this Phase 3 `vercel.json` / `api/` folder must not be
  used with a static-folder upload, and the Phase 2 `vercel.json` must not
  be added to an SSR deployment.
- Rollback changes no data: orders, customers and catalogue are untouched in
  every scenario, and the Phase 6 database rules stay exactly as they are.
