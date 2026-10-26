import { Injectable, inject, signal } from '@angular/core';
import { SupabaseSitePageRepository } from '../data-access/supabase/supabase.repositories';
import { Json } from '../data-access/models/database.types';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';
import {
  DEFAULT_BRANDS_STATS,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_NEWSLETTER,
  DEFAULT_SALE_SIDE_BANNER,
  DEFAULT_TESTIMONIALS,
  SitePageContent,
  SitePageSection,
  StorefrontBrandsStatsContent,
  StorefrontCustomContent,
  StorefrontNewsletterContent,
  StorefrontStaticContent,
  StorefrontTestimonialsContent,
} from '../shared/models/page-content.models';

/**
 * Storefront page-content service (Phase 6 page builder).
 *
 * A page is an ordered list of typed section instances stored in
 * site_pages / page_sections (phase-7 migration). Components read
 * sections from here; until the records load — or when the CMS is
 * unreachable — the homepage renders DEFAULT_HOME_SECTIONS, which
 * mirrors the seeded composition exactly, so the storefront never
 * depends on the CMS being up to render its front page.
 */
@Injectable({ providedIn: 'root' })
export class SitePagesService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly pageRepository = inject(SupabaseSitePageRepository);

  private readonly pagesSignal = signal<Map<string, SitePageContent>>(new Map());
  private readonly loadedSignal = signal<Set<string>>(new Set());
  private readonly requested = new Set<string>();

  async ensureLoaded(slug: string): Promise<void> {
    if (this.requested.has(slug)) return;
    this.requested.add(slug);

    if (!this.clientService.isConfigured()) {
      this.markLoaded(slug);
      return;
    }

    try {
      const page = await this.pageRepository.getPageBySlug(slug);
      if (page && page.is_active) {
        const rows = await this.pageRepository.listActiveSections(page.id);
        const sections: SitePageSection[] = rows.map(row => ({
          id: row.id,
          sectionType: row.section_type,
          content: this.asRecord(row.content),
          sortOrder: row.sort_order,
          isActive: row.is_active,
        }));
        this.pagesSignal.update(map => {
          const next = new Map(map);
          next.set(slug, { slug, title: page.title, sections });
          return next;
        });
      }
    } catch (error) {
      console.error(`Failed to load page content for "${slug}"; using built-in defaults.`, error);
    } finally {
      this.markLoaded(slug);
    }
  }

  /** True once a load attempt for the slug has finished (success or not). */
  isLoaded(slug: string): boolean {
    return this.loadedSignal().has(slug);
  }

  getPage(slug: string): SitePageContent | null {
    return this.pagesSignal().get(slug) ?? null;
  }

  /** Homepage sections: CMS records when loaded, the mirrored default composition otherwise. */
  homeSections(): SitePageSection[] {
    const sections = this.getPage('home')?.sections;
    return sections && sections.length ? sections : DEFAULT_HOME_SECTIONS;
  }

  sectionContent(section: SitePageSection, key: string, fallback = ''): string {
    const value = section.content[key];
    return typeof value === 'string' && value ? value : fallback;
  }

  /**
   * Optional per-section item limit (Phase 7). List-backed sections
   * may carry a positive `limit` in their payload; blank/invalid
   * values mean "no limit — keep the previous behaviour".
   */
  sectionLimit(section: SitePageSection): number | null {
    const value = section.content['limit'];
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
  }

  customContent(section: SitePageSection): StorefrontCustomContent {
    return {
      heading: this.sectionContent(section, 'heading'),
      body: this.sectionContent(section, 'body'),
      imagePath: this.stringValue(section.content['imagePath']),
      imageAlt: this.stringValue(section.content['imageAlt']),
      ctaText: this.stringValue(section.content['ctaText']),
      ctaLink: this.stringValue(section.content['ctaLink']),
    };
  }

  saleSideBanner(section: SitePageSection): { sideBannerTitle: string; sideBannerText: string } {
    return {
      sideBannerTitle: this.sectionContent(section, 'sideBannerTitle', DEFAULT_SALE_SIDE_BANNER.sideBannerTitle),
      sideBannerText: this.sectionContent(section, 'sideBannerText', DEFAULT_SALE_SIDE_BANNER.sideBannerText),
    };
  }

  testimonialsContent(section: SitePageSection): StorefrontTestimonialsContent {
    const items = this.recordArray(section.content['items'])
      .map(item => ({
        quote: this.stringValue(item['quote']) || '',
        author: this.stringValue(item['author']) || '',
      }))
      .filter(item => item.quote);
    return {
      eyebrow: this.sectionContent(section, 'eyebrow', DEFAULT_TESTIMONIALS.eyebrow),
      title: this.sectionContent(section, 'title', DEFAULT_TESTIMONIALS.title),
      items: items.length ? items : DEFAULT_TESTIMONIALS.items,
    };
  }

  brandsStatsContent(section: SitePageSection): StorefrontBrandsStatsContent {
    const brands = this.recordArray(section.content['brands'])
      .map(item => ({
        name: this.stringValue(item['name']) || '',
        styleKey: this.stringValue(item['styleKey']) || '',
      }))
      .filter(item => item.name);
    const statsItems = this.recordArray(section.content['statsItems'])
      .map(item => ({
        value: this.stringValue(item['value']) || '',
        label: this.stringValue(item['label']) || '',
      }))
      .filter(item => item.value || item.label);
    return {
      brands: brands.length ? brands : DEFAULT_BRANDS_STATS.brands,
      statsEyebrow: this.sectionContent(section, 'statsEyebrow', DEFAULT_BRANDS_STATS.statsEyebrow),
      statsItems: statsItems.length ? statsItems : DEFAULT_BRANDS_STATS.statsItems,
      statsBackgroundPath: this.sectionContent(section, 'statsBackgroundPath', DEFAULT_BRANDS_STATS.statsBackgroundPath),
      statsBackgroundAlt: this.sectionContent(section, 'statsBackgroundAlt', DEFAULT_BRANDS_STATS.statsBackgroundAlt),
    };
  }

  newsletterContent(section: SitePageSection): StorefrontNewsletterContent {
    return {
      eyebrow: this.sectionContent(section, 'eyebrow', DEFAULT_NEWSLETTER.eyebrow),
      heading: this.sectionContent(section, 'heading', DEFAULT_NEWSLETTER.heading),
      emailPlaceholder: this.sectionContent(section, 'emailPlaceholder', DEFAULT_NEWSLETTER.emailPlaceholder),
      buttonText: this.sectionContent(section, 'buttonText', DEFAULT_NEWSLETTER.buttonText),
      note: this.sectionContent(section, 'note', DEFAULT_NEWSLETTER.note),
    };
  }

  staticContent(section: SitePageSection): StorefrontStaticContent {
    const sections = this.recordArray(section.content['sections'])
      .map(item => ({
        title: this.stringValue(item['title']) || '',
        body: this.stringValue(item['body']) || '',
        icon: this.stringValue(item['icon']),
      }))
      .filter(item => item.title || item.body);
    const secondary = this.recordArray(section.content['secondary'])
      .map(item => ({
        label: this.stringValue(item['label']) || '',
        value: this.stringValue(item['value']) || '',
      }))
      .filter(item => item.label || item.value);
    return {
      eyebrow: this.stringValue(section.content['eyebrow']) || '',
      intro: this.stringValue(section.content['intro']) || '',
      icon: this.stringValue(section.content['icon']) || 'article',
      ctaText: this.stringValue(section.content['ctaText']),
      ctaLink: this.stringValue(section.content['ctaLink']),
      formType: this.stringValue(section.content['formType']),
      sections,
      secondary: secondary.length ? secondary : undefined,
    };
  }

  private markLoaded(slug: string) {
    this.loadedSignal.update(set => {
      const next = new Set(set);
      next.add(slug);
      return next;
    });
  }

  private asRecord(value: Json | Record<string, unknown>): Record<string, unknown> {
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
