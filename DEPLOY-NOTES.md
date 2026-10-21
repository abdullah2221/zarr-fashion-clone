# Deployment notes (prepared 21 Oct 2026 — deployment itself needs owner approval)

## Problem found on the live Vercel deployment
Only `/` loads. Every other route (/shop, /product/:id, /category/:slug, /cart,
/login, /admin, ...) returns Vercel's platform 404, because the project was
deployed as plain static files with no route fallback and no SSR wiring.

## Option A — quick restore (this package)
`vercel.json` rewrites every non-file path to `/index.html`. Vercel serves real
files (JS bundles, runtime-config.js, images) first and falls back to the app
shell for routes, so the Angular client router takes over. This restores all
pages immediately. Trade-off: pages render client-side (no SSR) until Option B.

## Option B — proper SSR (follow-up)
Recreate/adjust the Vercel project with the Angular framework preset so the
SSR server (dist/app/server/server.mjs) runs as a function, restoring
server-rendered HTML for SEO. Verify on a preview deployment first.

## Environment (set in the Vercel project, then redeploy)
- SUPABASE_URL, SUPABASE_ANON_KEY: already set correctly on the live project.
- APP_URL: MISSING today — add APP_URL=https://zarr-fashion-clone.vercel.app
  (or the future custom domain) so canonical/share URLs stop falling back to
  the ur-fashion.pk placeholder.
