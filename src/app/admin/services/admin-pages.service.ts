import { Injectable, inject, signal } from '@angular/core';
import { SupabaseSitePageRepository } from '../../data-access/supabase/supabase.repositories';
import { Json, Tables } from '../../data-access/models/database.types';
import {
  AdminSectionEditorValue,
  PAYLOAD_SECTION_TYPES,
} from '../models/admin-pages.models';

@Injectable({ providedIn: 'root' })
export class AdminPagesService {
  private readonly pageRepository = inject(SupabaseSitePageRepository);

  readonly pages = signal<Tables<'site_pages'>[]>([]);
  readonly sections = signal<Tables<'page_sections'>[]>([]);
  readonly selectedPage = signal<Tables<'site_pages'> | null>(null);
  readonly isLoading = signal(false);

  async load() {
    this.isLoading.set(true);
    try {
      const pages = await this.pageRepository.listAllPages();
      this.pages.set(pages);
      const current = this.selectedPage();
      const next = current ? pages.find(page => page.id === current.id) || pages[0] || null : pages[0] || null;
      if (next) {
        await this.selectPage(next);
      } else {
        this.selectedPage.set(null);
        this.sections.set([]);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async selectPage(page: Tables<'site_pages'>) {
    this.selectedPage.set(page);
    this.sections.set(await this.pageRepository.listAllSections(page.id));
  }

  async savePage(id: string | null, value: { slug: string; title: string; isActive: boolean }) {
    if (id) {
      await this.pageRepository.updatePage(id, { title: value.title, is_active: value.isActive });
    } else {
      await this.pageRepository.createPage({ slug: value.slug, title: value.title, is_active: value.isActive });
    }
    await this.load();
  }

  async deletePage(page: Tables<'site_pages'>) {
    await this.pageRepository.deletePage(page.id);
    if (this.selectedPage()?.id === page.id) {
      this.selectedPage.set(null);
    }
    await this.load();
  }

  emptySectionEditor(): AdminSectionEditorValue {
    return {
      sectionType: 'static-content',
      sortOrder: 10,
      isActive: true,
      eyebrow: '',
      title: '',
      sideBannerTitle: '',
      sideBannerText: '',
      itemsText: '',
      brandsText: '',
      statsEyebrow: '',
      statsItemsText: '',
      statsBackgroundPath: '',
      statsBackgroundAlt: '',
      heading: '',
      emailPlaceholder: '',
      buttonText: '',
      note: '',
      intro: '',
      icon: '',
      ctaText: '',
      ctaLink: '',
      formType: '',
      sectionsText: '',
      secondaryText: '',
    };
  }

  sectionToEditor(row: Tables<'page_sections'>): AdminSectionEditorValue {
    const editor = this.emptySectionEditor();
    const content = this.asRecord(row.content);
    editor.sectionType = row.section_type;
    editor.sortOrder = row.sort_order;
    editor.isActive = row.is_active;

    editor.eyebrow = this.stringValue(content['eyebrow']) || '';
    editor.title = this.stringValue(content['title']) || '';
    editor.sideBannerTitle = this.stringValue(content['sideBannerTitle']) || '';
    editor.sideBannerText = this.stringValue(content['sideBannerText']) || '';
    editor.itemsText = this.recordArray(content['items'])
      .map(item => `${this.stringValue(item['quote']) || ''} | ${this.stringValue(item['author']) || ''}`)
      .join('\n');
    editor.brandsText = this.recordArray(content['brands'])
      .map(item => `${this.stringValue(item['name']) || ''} | ${this.stringValue(item['styleKey']) || ''}`)
      .join('\n');
    editor.statsEyebrow = this.stringValue(content['statsEyebrow']) || '';
    editor.statsItemsText = this.recordArray(content['statsItems'])
      .map(item => `${this.stringValue(item['value']) || ''} | ${this.stringValue(item['label']) || ''}`)
      .join('\n');
    editor.statsBackgroundPath = this.stringValue(content['statsBackgroundPath']) || '';
    editor.statsBackgroundAlt = this.stringValue(content['statsBackgroundAlt']) || '';
    editor.heading = this.stringValue(content['heading']) || '';
    editor.emailPlaceholder = this.stringValue(content['emailPlaceholder']) || '';
    editor.buttonText = this.stringValue(content['buttonText']) || '';
    editor.note = this.stringValue(content['note']) || '';
    editor.intro = this.stringValue(content['intro']) || '';
    editor.icon = this.stringValue(content['icon']) || '';
    editor.ctaText = this.stringValue(content['ctaText']) || '';
    editor.ctaLink = this.stringValue(content['ctaLink']) || '';
    editor.formType = this.stringValue(content['formType']) || '';
    editor.sectionsText = this.recordArray(content['sections'])
      .map(item => `${this.stringValue(item['icon']) || ''} | ${this.stringValue(item['title']) || ''} | ${this.stringValue(item['body']) || ''}`)
      .join('\n');
    editor.secondaryText = this.recordArray(content['secondary'])
      .map(item => `${this.stringValue(item['label']) || ''} | ${this.stringValue(item['value']) || ''}`)
      .join('\n');
    return editor;
  }

  editorToContent(value: AdminSectionEditorValue, existing?: Json): Json {
    if (!PAYLOAD_SECTION_TYPES.includes(value.sectionType)) {
      // Sections whose content lives in another system keep whatever
      // payload they already carry; the row only controls order and
      // visibility for them.
      return existing ?? {};
    }

    switch (value.sectionType) {
      case 'carousel-sale':
        return {
          sideBannerTitle: value.sideBannerTitle.trim(),
          sideBannerText: value.sideBannerText.trim(),
        };
      case 'testimonials':
        return {
          eyebrow: value.eyebrow.trim(),
          title: value.title.trim(),
          items: this.parseLines(value.itemsText, ['quote', 'author']),
        };
      case 'brands-stats':
        return {
          brands: this.parseLines(value.brandsText, ['name', 'styleKey']),
          statsEyebrow: value.statsEyebrow.trim(),
          statsItems: this.parseLines(value.statsItemsText, ['value', 'label']),
          statsBackgroundPath: value.statsBackgroundPath.trim(),
          statsBackgroundAlt: value.statsBackgroundAlt.trim(),
        };
      case 'newsletter':
        return {
          eyebrow: value.eyebrow.trim(),
          heading: value.heading.trim(),
          emailPlaceholder: value.emailPlaceholder.trim(),
          buttonText: value.buttonText.trim(),
          note: value.note.trim(),
        };
      case 'static-content': {
        const content: Record<string, unknown> = {
          eyebrow: value.eyebrow.trim(),
          intro: value.intro.trim(),
          icon: value.icon.trim(),
          sections: this.parseLines(value.sectionsText, ['icon', 'title', 'body']).map(item => {
            const section: Record<string, string> = { title: item['title'] || '', body: item['body'] || '' };
            if (item['icon']) section['icon'] = item['icon'];
            return section;
          }),
        };
        if (value.ctaText.trim()) content['ctaText'] = value.ctaText.trim();
        if (value.ctaLink.trim()) content['ctaLink'] = value.ctaLink.trim();
        if (value.formType) content['formType'] = value.formType;
        const secondary = this.parseLines(value.secondaryText, ['label', 'value']);
        if (secondary.length) content['secondary'] = secondary;
        return content as Json;
      }
      default:
        return existing ?? {};
    }
  }

  async saveSection(id: string | null, value: AdminSectionEditorValue, existingContent?: Json) {
    const page = this.selectedPage();
    if (!page) throw new Error('Select a page first.');
    const payload = {
      section_type: value.sectionType,
      content: this.editorToContent(value, existingContent),
      sort_order: value.sortOrder ?? 0,
      is_active: value.isActive,
    };
    if (id) {
      await this.pageRepository.updateSection(id, payload);
    } else {
      await this.pageRepository.createSection({ page_id: page.id, ...payload });
    }
    this.sections.set(await this.pageRepository.listAllSections(page.id));
  }

  async toggleSection(row: Tables<'page_sections'>) {
    await this.pageRepository.updateSection(row.id, { is_active: !row.is_active });
    const page = this.selectedPage();
    if (page) {
      this.sections.set(await this.pageRepository.listAllSections(page.id));
    }
  }

  async deleteSection(row: Tables<'page_sections'>) {
    await this.pageRepository.deleteSection(row.id);
    const page = this.selectedPage();
    if (page) {
      this.sections.set(await this.pageRepository.listAllSections(page.id));
    }
  }

  private parseLines(text: string, keys: string[]): Array<Record<string, string>> {
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|').map(part => part.trim());
        const record: Record<string, string> = {};
        keys.forEach((key, index) => {
          record[key] = parts[index] || '';
        });
        return record;
      });
  }

  private asRecord(value: Json | null | undefined): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  }

  private recordArray(value: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(value)) return [];
    return value.map(item => this.asRecord(item as Json));
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }
}
