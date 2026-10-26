import { StorefrontNavLink } from '../../shared/models/storefront-content.models';

/**
 * Phase 8 — nav link text format. Used by the Settings row editor and
 * the storefront settings service; the text is still what the settings
 * form stores, so the storage format does not change.
 *
 * Lines: "Label | URL" plus an optional third segment of
 * comma-separated flags: `active`, `highlight`.
 *
 * One level of children: a line starting with "- " (optionally
 * indented) belongs to the most recent top-level link:
 *   Shop | /shop
 *     - Lawn | /category/lawn
 *     - Unstitched | /category/unstitched
 * A child line before any parent is kept as a top-level link, and a
 * child of a child still attaches to the same parent — so no link is
 * ever silently dropped or nested deeper than one level.
 */
export function parseNavLinks(text: string): StorefrontNavLink[] {
  const links: StorefrontNavLink[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const isChild = trimmed.startsWith('- ');
    const line = isChild ? trimmed.slice(2).trim() : trimmed;
    const [label = '', url = '', flags = ''] = line.split('|').map(part => part.trim());
    if (!label || !url) continue;
    const link: StorefrontNavLink = { label, url };
    const flagList = flags.split(',').map(flag => flag.trim()).filter(Boolean);
    if (flagList.includes('active')) link.active = true;
    if (flagList.includes('highlight')) link.highlight = true;
    if (isChild && links.length) {
      const parent = links[links.length - 1];
      parent.children = [...(parent.children ?? []), link];
    } else {
      links.push(link);
    }
  }
  return links;
}

export function serializeNavLinks(links: StorefrontNavLink[]): string {
  const render = (link: StorefrontNavLink): string => {
    const flags = [link.active ? 'active' : '', link.highlight ? 'highlight' : '']
      .filter(Boolean)
      .join(', ');
    return flags ? `${link.label} | ${link.url} | ${flags}` : `${link.label} | ${link.url}`;
  };
  const lines: string[] = [];
  for (const link of links) {
    lines.push(render(link));
    for (const child of link.children ?? []) lines.push(`  - ${render(child)}`);
  }
  return lines.join('\n');
}
