import { describe, expect, it } from 'vitest';
import { ADMIN_SECTION_TYPES, sectionTypeInfo } from './admin-pages.models';

describe('admin section types (Phase 8.1: non-developer copy)', () => {
  it('every section type has a plain-language label and description', () => {
    expect(ADMIN_SECTION_TYPES.length).toBeGreaterThan(0);
    for (const info of ADMIN_SECTION_TYPES) {
      expect(info.label.trim()).not.toBe('');
      expect(info.label).not.toBe(info.type);
      expect(info.description.trim()).not.toBe('');
      // Descriptions must read as plain words, not code: no kebab-case
      // type codes, no "payload", no "metadata" inside them.
      expect(info.description).not.toContain(info.type);
      expect(info.description.toLowerCase()).not.toContain('payload');
      expect(info.description.toLowerCase()).not.toContain('metadata');
    }
  });

  it('unknown types fall back without breaking the editor', () => {
    const info = sectionTypeInfo('no-such-type');
    expect(info.label).toBe('no-such-type');
    expect(info.description).toBe('');
    expect(info.contentOwner).toBeNull();
  });
});
