import { Injectable, computed, inject, signal } from '@angular/core';
import { HERO_SLIDES } from '../data/data';
import { SupabaseAdminRepository, SupabaseBannerRepository, SupabaseCampaignRepository, SupabaseStorageRepository } from '../data-access/supabase/supabase.repositories';
import { Json, Tables } from '../data-access/models/database.types';
import { HeroSlide } from '../shared/models/models';
import {
  StorefrontCampaignCard,
  StorefrontContentState,
  StorefrontFooterLinkColumn,
  StorefrontNavLink,
  StorefrontSettings,
  StorefrontTrustBadge,
} from '../shared/models/storefront-content.models';
import { SupabaseClientService } from '../core/supabase/supabase-client.service';

const DEFAULT_SETTINGS: StorefrontSettings = {
  storeName: 'Zeenat',
  whatsappNumber: '0320 0000000',
  supportEmail: 'support@ur-fashion.pk',
  supportPhone: '+92 300 0000000',
  freeDeliveryThreshold: 4999,
  deliveryFee: 0,
  deliveryMessage: 'Delivery across Pakistan with premium packaging and fast dispatch on active catalog items.',
  codMessage: 'Cash on Delivery is available on eligible orders across Pakistan.',
  exchangePolicySummary: 'Easy exchange support is available for eligible items in original condition.',
  socialLinks: {},
  defaultSeoTitle: 'Zeenat | Premium Pakistani Fashion',
  defaultSeoDescription: 'Premium Pakistani fashion for Eid, lawn season, weddings, and everyday elegance with Cash on Delivery and nationwide delivery.',
  campaignChips: ['Trending in Pakistan', 'Eid Collection', 'Ramadan Sale', 'Summer Lawn', 'Wedding/Formal', 'Ready to Wear', 'Unstitched', 'Stitched'],
  trustBadges: [
    { icon: 'local_shipping', label: 'Free delivery', detail: 'On orders over Rs. 4,999' },
    { icon: 'payments', label: 'Cash on Delivery', detail: 'Available across Pakistan' },
    { icon: 'verified_user', label: 'Secure checkout', detail: 'SSL protected shopping' },
    { icon: 'autorenew', label: 'Easy exchange', detail: 'Simple support-led process' },
  ],
  // Menu builder seeds (Phase 7): exactly the links the header,
  // mobile menu and footer rendered before they were editable.
  // Phase 8: the two placeholder categories (eid-edit, wedding) were
  // never live categories, so the fallback no longer links at them.
  headerNavLinks: [
    { label: 'New In', url: '/shop', active: true },
    { label: 'Lawn', url: '/category/lawn' },
    { label: 'Unstitched', url: '/category/unstitched' },
    { label: 'Sale', url: '/category/sale' },
  ],
  mobileNavLinks: [
    { label: 'Home', url: '/' },
    { label: 'New Arrivals', url: '/shop' },
    { label: 'Summer Lawn', url: '/category/lawn' },
    { label: 'Unstitched', url: '/category/unstitched' },
    { label: 'Sale', url: '/category/sale', highlight: true },
  ],
  footerLinkColumns: [
    {
      title: 'Help & Information',
      links: [
        { label: 'FAQs', url: '/faq' },
        { label: 'Contact Us', url: '/contact' },
        { label: 'Track Order', url: '/track-order' },
        { label: 'Delivery & Exchange Policy', url: '/return-exchange-policy' },
        { label: 'Terms & Conditions', url: '/terms-conditions' },
        { label: 'Privacy Policy', url: '/privacy-policy' },
      ],
    },
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', url: '/shop' },
        { label: 'Summer Lawn', url: '/category/lawn' },
        { label: 'Eid Collection', url: '/category/eid-edit' },
        { label: 'Wedding Edit', url: '/category/wedding' },
        { label: 'Sale', url: '/category/sale' },
        { label: 'About Zeenat', url: '/about' },
      ],
    },
  ],
  contactPageIntro: 'Support should be easy to find, especially for COD, exchange and delivery questions.',
  aboutPageIntro: 'Zeenat is positioned as a premium Pakistani fashion storefront for seasonal wardrobes, festive dressing and everyday confidence.',
  faqIntro: 'Answers to common shopping, delivery, COD and exchange questions.',
  privacySummary: 'Explain how Zeenat collects, uses and protects customer data for orders, delivery and support.',
  termsSummary: 'Set expectations for product availability, pricing, campaigns, checkout, delivery and use of the website.',
  returnExchangeSummary: 'Clear exchange guidance improves confidence for online fashion buyers, especially for size and fabric concerns.',
  bannerOverrides: {},
};

@Injectable({ providedIn: 'root' })
export class StorefrontContentService {
  private readonly clientService = inject(SupabaseClientService);
  private readonly bannerRepository = inject(SupabaseBannerRepository);
  private readonly campaignRepository = inject(SupabaseCampaignRepository);
  private readonly adminRepository = inject(SupabaseAdminRepository);
  private readonly storageRepository = inject(SupabaseStorageRepository);

  private readonly bannersSignal = signal<Tables<'banners'>[]>([]);
  private readonly campaignsSignal = signal<Tables<'campaigns'>[]>([]);
  private readonly settingsSignal = signal<StorefrontSettings>(DEFAULT_SETTINGS);
  private readonly loadingSignal = signal(false);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();
  readonly campaignChips = computed(() => this.settingsSignal().campaignChips);
  readonly trustBadges = computed(() => this.settingsSignal().trustBadges);
  readonly heroSlides = computed(() => {
    const banners = this.bannersSignal().filter(banner => this.isActiveEntry(banner.is_active, banner.starts_at, banner.ends_at));
    if (!banners.length) return HERO_SLIDES;

    return banners.map((banner, index) => {
      const extra = this.settingsSignal().bannerOverrides[banner.id] || {};
      return {
        id: index + 1,
        imageUrl: banner.image_path ? this.storageRepository.getPublicImageUrl(banner.image_path) : HERO_SLIDES[0]?.imageUrl || '',
        title: banner.title,
        subtitle: banner.subtitle || '',
        ctaLink: banner.target_url || '/shop',
        eyebrow: extra.campaignType || 'Seasonal Edit',
        description: extra.description,
        ctaText: extra.ctaText || 'Shop now',
        secondaryCtaText: extra.secondaryCtaText,
        secondaryCtaLink: banner.target_url || '/shop',
        campaignTag: extra.placement ? this.prettyPlacement(extra.placement) : 'Featured',
      } satisfies HeroSlide;
    });
  });

  readonly homeCampaigns = computed(() =>
    this.mappedCampaigns().filter(item => item.placement === 'home-section')
  );

  readonly offerCampaigns = computed(() =>
    this.mappedCampaigns().filter(item => item.placement === 'offer-grid')
  );

  readonly featuredCollections = computed(() =>
    this.mappedCampaigns().filter(item => item.placement === 'featured-collections')
  );

  readonly shopBanner = computed(() =>
    this.mappedCampaigns().find(item => item.placement === 'shop-banner') || null
  );

  readonly state = computed<StorefrontContentState>(() => ({
    heroSlides: this.heroSlides(),
    homeCampaigns: this.homeCampaigns(),
    offerCampaigns: this.offerCampaigns(),
    featuredCollections: this.featuredCollections(),
    shopBanner: this.shopBanner(),
    settings: this.settingsSignal(),
  }));

  constructor() {
    void this.load();
  }

  async refresh() {
    await this.load();
  }

  private async load() {
    if (!this.clientService.isConfigured()) {
      this.useFallback();
      return;
    }

    this.loadingSignal.set(true);
    try {
      const [banners, campaigns, storefrontSettings] = await Promise.all([
        this.bannerRepository.listActive(),
        this.campaignRepository.listActive(),
        this.adminRepository.getSetting('storefront_settings'),
      ]);

      this.bannersSignal.set(banners);
      this.campaignsSignal.set(campaigns);
      this.settingsSignal.set(this.mergeSettings(storefrontSettings?.value));
    } catch (error) {
      console.error('Failed to load storefront content; using local fallback.', error);
      this.useFallback();
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private useFallback() {
    this.bannersSignal.set([]);
    this.campaignsSignal.set([]);
    this.settingsSignal.set(DEFAULT_SETTINGS);
  }

  private mergeSettings(value: Json | null | undefined): StorefrontSettings {
    const raw = this.asRecord(value);
    return {
      ...DEFAULT_SETTINGS,
      ...raw,
      socialLinks: {
        ...DEFAULT_SETTINGS.socialLinks,
        ...this.asRecord(raw['socialLinks']),
      },
      campaignChips: this.stringArray(raw['campaignChips']) || DEFAULT_SETTINGS.campaignChips,
      trustBadges: this.trustBadgeArray(raw['trustBadges']) || DEFAULT_SETTINGS.trustBadges,
      headerNavLinks: this.navLinkArray(raw['headerNavLinks']) || DEFAULT_SETTINGS.headerNavLinks,
      mobileNavLinks: this.navLinkArray(raw['mobileNavLinks']) || DEFAULT_SETTINGS.mobileNavLinks,
      footerLinkColumns: this.footerColumnArray(raw['footerLinkColumns']) || DEFAULT_SETTINGS.footerLinkColumns,
      bannerOverrides: this.bannerOverrideMap(raw['bannerOverrides']),
    };
  }

  private navLinkArray(value: unknown): StorefrontNavLink[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const links = value
      .map(item => this.navLinkFromRecord(item))
      .filter((link): link is StorefrontNavLink => link !== null);
    return links.length ? links : undefined;
  }

  /** One record → one link. Children are parsed one level deep only. */
  private navLinkFromRecord(item: unknown): StorefrontNavLink | null {
    const record = this.asRecord(item);
    if (typeof record['label'] !== 'string' || typeof record['url'] !== 'string'
      || !record['label'] || !record['url']) return null;
    const link: StorefrontNavLink = { label: record['label'] as string, url: record['url'] as string };
    if (record['highlight'] === true) link.highlight = true;
    if (record['active'] === true) link.active = true;
    if (Array.isArray(record['children'])) {
      const children = record['children']
        .map(child => this.navLinkFromRecord(child))
        .filter((child): child is StorefrontNavLink => child !== null)
        .map(child => {
          // Enforce one level: a child's own children are dropped.
          const { children: _dropped, ...flat } = child;
          return flat;
        });
      if (children.length) link.children = children;
    }
    return link;
  }

  private footerColumnArray(value: unknown): StorefrontFooterLinkColumn[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const columns = value
      .map(item => this.asRecord(item))
      .filter(item => typeof item['title'] === 'string' && item['title'])
      .map(item => ({
        title: item['title'] as string,
        links: this.navLinkArray(item['links']) || [],
      }))
      .filter(column => column.links.length);
    return columns.length ? columns : undefined;
  }

  private mappedCampaigns(): StorefrontCampaignCard[] {
    return this.campaignsSignal()
      .map(campaign => this.mapCampaign(campaign))
      .filter(campaign => this.isActiveEntry(campaign.isActive, campaign.startDate || null, campaign.endDate || null))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  }

  private mapCampaign(campaign: Tables<'campaigns'>): StorefrontCampaignCard {
    const metadata = this.asRecord(campaign.metadata);
    return {
      id: campaign.id,
      title: typeof metadata['title'] === 'string' ? metadata['title'] : campaign.name,
      subtitle: this.stringValue(metadata['subtitle']),
      description: campaign.description || this.stringValue(metadata['description']),
      imageUrl: this.stringValue(metadata['imagePath']) ? this.storageRepository.getPublicImageUrl(this.stringValue(metadata['imagePath'])!) : undefined,
      linkUrl: this.stringValue(metadata['linkUrl']) || '/shop',
      ctaText: this.stringValue(metadata['ctaText']) || 'Explore',
      campaignType: this.stringValue(metadata['campaignType']) || campaign.slug,
      placement: this.stringValue(metadata['placement']) || 'home-section',
      isActive: campaign.is_active,
      sortOrder: this.numberValue(metadata['sortOrder']) ?? 0,
      startDate: campaign.starts_at,
      endDate: campaign.ends_at,
      tag: this.stringValue(metadata['tag']),
    };
  }

  private isActiveEntry(isActive: boolean, startsAt: string | null, endsAt: string | null) {
    if (!isActive) return false;
    const now = Date.now();
    const start = startsAt ? new Date(startsAt).getTime() : null;
    const end = endsAt ? new Date(endsAt).getTime() : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }

  private prettyPlacement(placement: string) {
    return placement.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  private trustBadgeArray(value: unknown): StorefrontTrustBadge[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value
      .map(item => this.asRecord(item))
      .filter(item => typeof item['icon'] === 'string' && typeof item['label'] === 'string')
      .map(item => ({
        icon: item['icon'] as string,
        label: item['label'] as string,
        detail: typeof item['detail'] === 'string' ? item['detail'] : undefined,
      }));
  }

  private bannerOverrideMap(value: unknown) {
    const record = this.asRecord(value);
    return Object.fromEntries(
      Object.entries(record).map(([key, item]) => {
        const raw = this.asRecord(item);
        return [
          key,
          {
            description: this.stringValue(raw['description']),
            ctaText: this.stringValue(raw['ctaText']),
            secondaryCtaText: this.stringValue(raw['secondaryCtaText']),
            placement: this.stringValue(raw['placement']),
            campaignType: this.stringValue(raw['campaignType']),
          },
        ];
      })
    );
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value : undefined;
  }

  private numberValue(value: unknown) {
    return typeof value === 'number' ? value : undefined;
  }

  private stringArray(value: unknown) {
    return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined;
  }
}
