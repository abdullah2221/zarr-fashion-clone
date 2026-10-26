/**
 * Phase 8 — pure sitemap builders (no Node APIs, so unit tests can import
 * this file under the browser test config; the Supabase fetching and the
 * Express handler live in `server-sitemap.ts`, which only `server.ts`
 * imports).
 */

const FIXED_PATHS = ['/', '/shop', '/track-order'];

const KNOWN_PAGE_SLUGS = [
  'about',
  'contact',
  'faq',
  'privacy-policy',
  'terms-conditions',
  'return-exchange-policy',
];

/** Alias routes that point at a canonical page record. */
const PAGE_ALIASES: Record<string, string> = {
  'terms-conditions': '/terms',
  'return-exchange-policy': '/return-exchange',
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Public paths for the static pages. `activeSlugs` is null when the
 * database could not be read, in which case every known page is listed
 * (the pre-Phase-8 behaviour) rather than an empty sitemap.
 */
export function resolvePagePaths(activeSlugs: string[] | null): string[] {
  const slugs = activeSlugs ?? KNOWN_PAGE_SLUGS;
  const paths: string[] = [];
  for (const slug of KNOWN_PAGE_SLUGS) {
    if (!slugs.includes(slug)) continue;
    paths.push(`/${slug}`);
    const alias = PAGE_ALIASES[slug];
    if (alias) paths.push(alias);
  }
  return paths;
}

export function buildSitemapXml(
  baseUrl: string,
  pagePaths: string[],
  categorySlugs: string[],
  productIds: Array<string | number>,
): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  const add = (path: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    urls.push(path);
  };
  for (const path of FIXED_PATHS) add(path);
  for (const path of pagePaths) add(path);
  for (const slug of categorySlugs) add(`/category/${slug}`);
  for (const id of productIds) add(`/product/${id}`);

  const base = baseUrl.replace(/\/$/, '');
  const body = urls
    .map((path) => `  <url><loc>${escapeXml(base + path)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
