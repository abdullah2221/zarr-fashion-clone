// Vercel Serverless Function entry for Angular SSR (Phase 3).
//
// Vercel does not run dist/app/server/server.mjs by itself for an Angular
// project. This function is the bridge: vercel.json rewrites every request
// that is not an existing static file to /api/index, and this handler passes
// the request to the Angular SSR engine exported by the production build
// (src/server.ts exports `reqHandler` via createNodeRequestHandler).
//
// The whole dist/app output (server bundle + browser statics) is bundled
// into this function through the "includeFiles" entry in vercel.json,
// because server.mjs serves the browser files itself and renders all other
// routes on the server.
//
// The dynamic import is deliberate: the server bundle is ESM (.mjs) and is
// produced by the build, so it can only be loaded at request time.
export default async function handler(req, res) {
  const { reqHandler } = await import('../dist/app/server/server.mjs');
  return reqHandler(req, res);
}
