import { describe, expect, it } from 'vitest';
import { parseNavLinks, serializeNavLinks } from './nav-link-text';

describe('nav link text format (Phase 8)', () => {
  it('parses flat links with flags, skipping blanks and incomplete lines', () => {
    expect(
      parseNavLinks('New In | /shop | active\nLawn | /category/lawn\n\nBad line\n | /nowhere\nSale | /category/sale | highlight'),
    ).toEqual([
      { label: 'New In', url: '/shop', active: true },
      { label: 'Lawn', url: '/category/lawn' },
      { label: 'Sale', url: '/category/sale', highlight: true },
    ]);
  });

  it('parses one level of children and keeps them flat under the parent', () => {
    expect(
      parseNavLinks('Shop | /shop\n  - Lawn | /category/lawn\n- Unstitched | /category/unstitched\n  - Nested? | /x\nSale | /category/sale'),
    ).toEqual([
      {
        label: 'Shop',
        url: '/shop',
        children: [
          { label: 'Lawn', url: '/category/lawn' },
          { label: 'Unstitched', url: '/category/unstitched' },
          { label: 'Nested?', url: '/x' },
        ],
      },
      { label: 'Sale', url: '/category/sale' },
    ]);
  });

  it('keeps an orphan child line as a top-level link', () => {
    expect(parseNavLinks('- Orphan | /orphan')).toEqual([
      { label: 'Orphan', url: '/orphan' },
    ]);
  });

  it('round-trips links with children and flags exactly', () => {
    const links = [
      { label: 'Shop', url: '/shop', children: [
        { label: 'Lawn', url: '/category/lawn', highlight: true },
        { label: 'Unstitched', url: '/category/unstitched' },
      ] },
      { label: 'Sale', url: '/category/sale', active: true },
    ];
    expect(parseNavLinks(serializeNavLinks(links))).toEqual(links);
    expect(serializeNavLinks(links)).toBe(
      'Shop | /shop\n  - Lawn | /category/lawn | highlight\n  - Unstitched | /category/unstitched\nSale | /category/sale | active',
    );
  });
});
