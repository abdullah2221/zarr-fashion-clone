/**
 * Phase 8 — dynamic sitemap (fetching + Express handler).
 *
 * The pure XML builders live in `server-sitemap-xml.ts` (no Node APIs, so
 * unit tests can import them); this file only adds the Supabase reads and
 * the handler, and is imported solely by `server.ts`.
 */

import { buildSitemapXml, resolvePagePaths } from './server-sitemap-xml';

interface SitemapData {
  pageSlugs: string[] | null;
  categorySlugs: string[];
  productIds: Array<string | number>;
}

async function fetchRows(
  supabaseUrl: string,
  anonKey: string,
  table: string,
  select: string,
): Promise<Array<Record<string, unknown>>> {
  const url =
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}` +
    `?select=${select}&is_active=eq.true&limit=1000`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSitemapData(
  supabaseUrl: string,
  anonKey: string,
): Promise<SitemapData> {
  const [pages, categories, products] = await Promise.all([
    fetchRows(supabaseUrl, anonKey, 'site_pages', 'slug'),
    fetchRows(supabaseUrl, anonKey, 'categories', 'slug'),
    fetchRows(supabaseUrl, anonKey, 'products', 'legacy_id'),
  ]);
  // An empty pages result is ambiguous (fetch failed vs no pages), so a
  // failed read must not deactivate every page: only treat it as a real
  // answer when at least the home record came back. The home page is
  // always active, so its absence means the read failed.
  const pageSlugs =
    pages.some((row) => row['slug'] === 'home')
      ? pages
          .map((row) => row['slug'])
          .filter((slug): slug is string => typeof slug === 'string')
      : null;
  return {
    pageSlugs,
    categorySlugs: categories
      .map((row) => row['slug'])
      .filter((slug): slug is string => typeof slug === 'string'),
    productIds: products
      .map((row) => row['legacy_id'])
      .filter(
        (id): id is string | number =>
          typeof id === 'string' || typeof id === 'number',
      ),
  };
}

export function getSitemapBaseUrl(): string {
  const appUrl = process.env['APP_URL'];
  if (appUrl) {
    try {
      return new URL(appUrl).origin;
    } catch {
      // Fall through to the default below.
    }
  }
  return 'https://zarr-fashion-clone.vercel.app';
}

/** Express handler for GET /sitemap.xml. Never throws to the caller. */
export async function handleSitemap(
  _req: unknown,
  res: {
    setHeader: (name: string, value: string) => void;
    send: (body: string) => void;
  },
): Promise<void> {
  const supabaseUrl = process.env['SUPABASE_URL'];
  const anonKey = process.env['SUPABASE_ANON_KEY'];
  let data: SitemapData = {
    pageSlugs: null,
    categorySlugs: [],
    productIds: [],
  };
  if (supabaseUrl && anonKey) {
    try {
      data = await fetchSitemapData(supabaseUrl, anonKey);
    } catch (error) {
      console.error('Dynamic sitemap: failed to read Supabase, using fixed routes.', error);
    }
  }
  const xml = buildSitemapXml(
    getSitemapBaseUrl(),
    resolvePagePaths(data.pageSlugs),
    data.categorySlugs,
    data.productIds,
  );
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
}
