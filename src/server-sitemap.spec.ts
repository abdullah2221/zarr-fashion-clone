import { describe, expect, it } from 'vitest';
import {
  buildSitemapXml,
  escapeXml,
  resolvePagePaths,
} from './server-sitemap-xml';

describe('dynamic sitemap (Phase 8)', () => {
  it('lists fixed routes, active pages with aliases, live categories and products', () => {
    const xml = buildSitemapXml(
      'https://zarr-fashion-clone.vercel.app',
      resolvePagePaths(['about', 'terms-conditions', 'home']),
      ['unstitched', 'lawn'],
      [11, 21],
    );
    for (const path of [
      '/',
      '/shop',
      '/track-order',
      '/about',
      '/terms-conditions',
      '/terms',
      '/category/unstitched',
      '/category/lawn',
      '/product/11',
      '/product/21',
    ]) {
      expect(xml).toContain(
        `<loc>https://zarr-fashion-clone.vercel.app${path}</loc>`,
      );
    }
    // Home is the root URL, not a /home entry; inactive pages are absent.
    expect(xml).not.toContain('/home</loc>');
    expect(xml).not.toContain('/contact</loc>');
    expect(xml).not.toContain('/return-exchange');
  });

  it('deduplicates paths and falls back to all known pages when the DB read fails', () => {
    const xml = buildSitemapXml(
      'https://example.test/',
      resolvePagePaths(null),
      ['lawn', 'lawn'],
      [],
    );
    expect(xml.match(/\/category\/lawn<\/loc>/g)).toHaveLength(1);
    expect(xml).toContain('/terms-conditions</loc>');
    expect(xml).toContain('/terms</loc>');
    expect(xml).toContain('/return-exchange-policy</loc>');
    expect(xml).toContain('/return-exchange</loc>');
  });

  it('escapes XML characters in slugs', () => {
    expect(escapeXml('a&b<c>"d\'e')).toBe('a&amp;b&lt;c&gt;&quot;d&apos;e');
    const xml = buildSitemapXml('https://example.test', [], ['a&b'], []);
    expect(xml).toContain('/category/a&amp;b</loc>');
  });
});
