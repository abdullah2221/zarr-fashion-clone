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
