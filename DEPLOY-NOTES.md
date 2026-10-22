# Deployment notes — Phase 3: real SSR on Vercel + admin spacing (prepared 21 Oct 2026)

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
