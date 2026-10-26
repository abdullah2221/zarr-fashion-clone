import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import {loadServerEnvironment} from './server-env';
import {installServerWebSocketTransport} from './server-websocket';
import {handleSitemap} from './server-sitemap';

loadServerEnvironment();
installServerWebSocketTransport();

const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Hosts the SSR engine is allowed to serve.
 *
 * @angular/ssr validates the `Host` (and `X-Forwarded-Host`) header of every
 * request against an allowlist as an SSRF guard. The generated app-engine
 * manifest only contains `localhost` and `127.0.0.1`, so without this option
 * every request arriving under the real domain is rejected with
 * HTTP 400: `Header "host" with value "..." is not allowed.`
 *
 * Entries starting with `*.` are suffix matches in the engine, so
 * `*.vercel.app` covers every Vercel preview/deployment URL of this project
 * while the production domain is listed exactly. The hostname of `APP_URL`
 * is included when it is set, so a future custom domain only needs the
 * environment variable. `localhost`/`127.0.0.1` stay allowed via the build
 * manifest, and the `NG_ALLOWED_HOSTS` environment variable (comma
 * separated) overrides this list when set — both are @angular/ssr's own
 * mechanisms.
 */
const appUrlHost = (() => {
  const appUrl = process.env['APP_URL'];
  if (!appUrl) {
    return undefined;
  }
  try {
    return new URL(appUrl).hostname || undefined;
  } catch {
    return undefined;
  }
})();

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'zarr-fashion-clone.vercel.app',
    '*.vercel.app',
    ...(appUrlHost ? [appUrlHost] : []),
  ],
  /**
   * Proxy headers set by Vercel's edge on every request to the serverless
   * function (Phase 5 fix — without this, SSR never renders on Vercel).
   *
   * @angular/ssr treats any `x-forwarded-*` header that is NOT in this list
   * as a sign the request passed through an unconfigured proxy: it strips
   * the header and "deopts" the request to client-side rendering, serving
   * the empty `index.csr.html` shell with HTTP 200 instead of the SSR page
   * (see `sanitizeRequestHeaders` / `serveClientSidePage` in @angular/ssr).
   * Angular's default trust list contains only `x-forwarded-host` and
   * `x-forwarded-proto`, but Vercel's edge also always adds
   * `x-forwarded-for` and `x-forwarded-port` — so on Vercel every request
   * deopted and production served the CSR shell for all routes, while
   * local runs (no `x-forwarded-*` headers at all) rendered full SSR.
   *
   * Trusting these five standard headers is safe here: the function is
   * only reachable through Vercel's edge, which sets/overwrites them, and
   * the SSRF guard above is unchanged — the `Host` and `X-Forwarded-Host`
   * header VALUES are still validated against `allowedHosts`, and the
   * port/proto/prefix values are still format-validated by the engine.
   * (The `NG_TRUST_PROXY_HEADERS` env var can still override this list.)
   */
  trustProxyHeaders: [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-port',
    'x-forwarded-proto',
    'x-forwarded-prefix',
  ],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Dynamic sitemap (Phase 8). Registered BEFORE the static-file middleware
 * on purpose: the static layer would otherwise serve a stale
 * `sitemap.xml` from the browser output, and this handler would never
 * run. The old static file has been deleted from `public/`.
 */
app.get('/sitemap.xml', (req, res) => {
  void handleSitemap(req, res).catch((error: unknown) => {
    console.error('Dynamic sitemap: unexpected failure.', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://zarr-fashion-clone.vercel.app</loc></url>\n</urlset>\n',
    );
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
