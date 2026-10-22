import { Injectable, computed, inject, signal } from '@angular/core';
import { Inserts, Json, Tables } from '../../data-access/models/database.types';
import {
  SupabaseAdminRepository,
  SupabaseBannerRepository,
  SupabaseCampaignRepository,
  SupabaseStorageRepository,
} from '../../data-access/supabase/supabase.repositories';
import {
  AdminBannerEditorValue,
  AdminBannerListItem,
  AdminCampaignEditorValue,
  AdminCampaignListItem,
  AdminCampaignPlacement,
} from '../models/admin-marketing.models';
import { StorefrontContentService } from '../../services/storefront-content.service';

@Injectable({ providedIn: 'root' })
export class AdminCampaignsService {
  private readonly bannerRepository = inject(SupabaseBannerRepository);
  private readonly campaignRepository = inject(SupabaseCampaignRepository);
  private readonly adminRepository = inject(SupabaseAdminRepository);
  private readonly storageRepository = inject(SupabaseStorageRepository);
  private readonly storefront = inject(StorefrontContentService);

  private readonly bannersSignal = signal<Tables<'banners'>[]>([]);
  private readonly campaignsSignal = signal<Tables<'campaigns'>[]>([]);
  private readonly bannerOverridesSignal = signal<Record<string, Record<string, string>>>({});
  private readonly loadingSignal = signal(false);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly banners = this.bannersSignal.asReadonly();
  readonly campaigns = this.campaignsSignal.asReadonly();
  readonly bannerList = computed<AdminBannerListItem[]>(() =>
    this.bannersSignal().map(banner => {
      const overrides = this.bannerOverridesSignal()[banner.id] || {};
      return {
        record: banner,
        imageUrl: banner.image_path ? this.storageRepository.getPublicImageUrl(banner.image_path) : '/images/product-placeholder.svg',
        description: overrides['description'] || '',
        ctaText: overrides['ctaText'] || '',
        secondaryCtaText: overrides['secondaryCtaText'] || '',
        placement: (overrides['placement'] as AdminCampaignPlacement) || 'home-hero',
        campaignType: overrides['campaignType'] || '',
      };
    }).sort((a, b) => a.record.sort_order - b.record.sort_order)
  );
  readonly campaignList = computed<AdminCampaignListItem[]>(() =>
    this.campaignsSignal().map(campaign => {
      const metadata = this.asRecord(campaign.metadata);
      const imagePath = typeof metadata['imagePath'] === 'string' ? metadata['imagePath'] : undefined;
      return {
        record: campaign,
        imageUrl: imagePath ? this.storageRepository.getPublicImageUrl(imagePath) : undefined,
        title: typeof metadata['title'] === 'string' ? metadata['title'] : campaign.name,
        subtitle: typeof metadata['subtitle'] === 'string' ? metadata['subtitle'] : '',
        linkUrl: typeof metadata['linkUrl'] === 'string' ? metadata['linkUrl'] : '/shop',
        ctaText: typeof metadata['ctaText'] === 'string' ? metadata['ctaText'] : 'Explore',
        placement: (typeof metadata['placement'] === 'string' ? metadata['placement'] : 'home-section') as AdminCampaignPlacement,
        campaignType: typeof metadata['campaignType'] === 'string' ? metadata['campaignType'] : campaign.slug,
        sortOrder: typeof metadata['sortOrder'] === 'number' ? metadata['sortOrder'] : 0,
        tag: typeof metadata['tag'] === 'string' ? metadata['tag'] : '',
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder)
  );

  async load() {
    this.loadingSignal.set(true);
    try {
      const [banners, campaigns, storefrontSettings] = await Promise.all([
        this.bannerRepository.listAll(),
        this.campaignRepository.listAll(),
        this.adminRepository.getSetting('storefront_settings'),
      ]);

      const settingValue = this.asRecord(storefrontSettings?.value);
      this.bannersSignal.set(banners);
      this.campaignsSignal.set(campaigns);
      this.bannerOverridesSignal.set(this.asNestedRecord(settingValue['bannerOverrides']));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  createBannerFormValue(record: AdminBannerListItem | null): AdminBannerEditorValue {
    return {
      title: record?.record.title || '',
      subtitle: record?.record.subtitle || '',
      description: record?.description || '',
      ctaText: record?.ctaText || '',
      secondaryCtaText: record?.secondaryCtaText || '',
      campaignType: record?.campaignType || '',
      placement: record?.placement || 'home-hero',
      linkUrl: record?.record.target_url || '/shop',
      isActive: record?.record.is_active ?? true,
      sortOrder: record?.record.sort_order ?? 0,
      startDate: record?.record.starts_at ? record.record.starts_at.slice(0, 10) : '',
      endDate: record?.record.ends_at ? record.record.ends_at.slice(0, 10) : '',
    };
  }

  createCampaignFormValue(record: AdminCampaignListItem | null): AdminCampaignEditorValue {
    return {
      title: record?.title || '',
      slug: record?.record.slug || '',
      subtitle: record?.subtitle || '',
      description: record?.record.description || '',
      imagePath: record?.imageUrl || null,
      linkUrl: record?.linkUrl || '/shop',
      ctaText: record?.ctaText || 'Explore',
      campaignType: record?.campaignType || '',
      placement: record?.placement || 'home-section',
      active: record?.record.is_active ?? true,
      sortOrder: record?.sortOrder ?? 0,
      startDate: record?.record.starts_at ? record.record.starts_at.slice(0, 10) : '',
      endDate: record?.record.ends_at ? record.record.ends_at.slice(0, 10) : '',
      tag: record?.tag || '',
    };
  }

  async saveBanner(current: AdminBannerListItem | null, value: AdminBannerEditorValue, imageFile: File | null) {
    let imagePath = current?.record.image_path || null;
    if (imageFile) {
      imagePath = await this.storageRepository.uploadPublicImage(this.bannerImagePath(current?.record.id || crypto.randomUUID(), imageFile.name), imageFile, { upsert: true });
    }

    const payload: Inserts<'banners'> = {
      title: value.title,
      subtitle: value.subtitle || null,
      image_path: imagePath,
      target_url: value.linkUrl || null,
      starts_at: value.startDate || null,
      ends_at: value.endDate || null,
      is_active: value.isActive,
      sort_order: value.sortOrder ?? 0,
    };

    const saved = current
      ? await this.bannerRepository.update(current.record.id, payload)
      : await this.bannerRepository.create(payload);

    await this.saveBannerOverrides(saved.id, {
      description: value.description,
      ctaText: value.ctaText,
      secondaryCtaText: value.secondaryCtaText,
      placement: value.placement,
      campaignType: value.campaignType,
    });
    await this.load();
    await this.storefront.refresh();
    return saved;
  }

  async saveCampaign(current: AdminCampaignListItem | null, value: AdminCampaignEditorValue, imageFile: File | null) {
    const currentMetadata = current ? this.asRecord(current.record.metadata) : {};
    let imagePath = typeof currentMetadata['imagePath'] === 'string' ? currentMetadata['imagePath'] : null;
    if (imageFile) {
      imagePath = await this.storageRepository.uploadPublicImage(this.campaignImagePath(value.slug || current?.record.id || 'campaign', imageFile.name), imageFile, { upsert: true });
    }

    const metadata: Record<string, Json> = {
      title: value.title,
      subtitle: value.subtitle,
      imagePath,
      linkUrl: value.linkUrl,
      ctaText: value.ctaText,
      campaignType: value.campaignType,
      placement: value.placement,
      sortOrder: value.sortOrder ?? 0,
      tag: value.tag,
    };

    const payload: Inserts<'campaigns'> = {
      name: value.title,
      slug: value.slug,
      description: value.description || null,
      starts_at: value.startDate || null,
      ends_at: value.endDate || null,
      is_active: value.active,
      metadata,
    };

    const saved = current
      ? await this.campaignRepository.update(current.record.id, payload)
      : await this.campaignRepository.create(payload);

    await this.load();
    await this.storefront.refresh();
    return saved;
  }

  async toggleBannerActive(record: Tables<'banners'>, active: boolean) {
    await this.bannerRepository.update(record.id, { is_active: active });
    await this.load();
    await this.storefront.refresh();
  }

  async toggleCampaignActive(record: Tables<'campaigns'>, active: boolean) {
    await this.campaignRepository.update(record.id, { is_active: active });
    await this.load();
    await this.storefront.refresh();
  }

  async deleteBanner(item: AdminBannerListItem) {
    await this.bannerRepository.delete(item.record.id);
    if (item.record.image_path) {
      await this.storageRepository.removePublicImage(item.record.image_path);
    }
    const nextOverrides = { ...this.bannerOverridesSignal() };
    delete nextOverrides[item.record.id];
    await this.persistStorefrontSetting('bannerOverrides', this.bannerOverridesJson(nextOverrides));
    await this.load();
    await this.storefront.refresh();
  }

  async deleteCampaign(item: AdminCampaignListItem) {
    const metadata = this.asRecord(item.record.metadata);
    if (typeof metadata['imagePath'] === 'string') {
      await this.storageRepository.removePublicImage(metadata['imagePath']);
    }
    await this.campaignRepository.delete(item.record.id);
    await this.load();
    await this.storefront.refresh();
  }

  private async saveBannerOverrides(id: string, value: Record<string, string>) {
    const nextOverrides = { ...this.bannerOverridesSignal(), [id]: value };
    await this.persistStorefrontSetting('bannerOverrides', this.bannerOverridesJson(nextOverrides));
    this.bannerOverridesSignal.set(nextOverrides);
  }

  private async persistStorefrontSetting(key: string, value: Json) {
    const row = await this.adminRepository.getSetting('storefront_settings');
    const current = this.asRecord(row?.value);
    const next: Record<string, Json> = { ...current, [key]: value };
    await this.adminRepository.upsertSetting({ key: 'storefront_settings', value: next });
  }

  private bannerImagePath(id: string, filename: string) {
    const extension = filename.split('.').pop() || 'jpg';
    return `banners/${id}.${extension}`;
  }

  private campaignImagePath(slug: string, filename: string) {
    const extension = filename.split('.').pop() || 'jpg';
    return `campaigns/${slug}.${extension}`;
  }

  private asRecord(value: unknown): Record<string, Json> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};
  }

  private asNestedRecord(value: unknown): Record<string, Record<string, string>> {
    const record = this.asRecord(value);
    return Object.fromEntries(
      Object.entries(record).map(([key, nested]) => {
        const values = this.asRecord(nested);
        return [key, Object.fromEntries(Object.entries(values).map(([innerKey, innerValue]) => [innerKey, typeof innerValue === 'string' ? innerValue : '']))];
      })
    );
  }

  private bannerOverridesJson(overrides: Record<string, Record<string, string>>): Json {
    return Object.fromEntries(
      Object.entries(overrides).map(([bannerId, values]) => [
        bannerId,
        Object.fromEntries(
          Object.entries(values).map(([innerKey, innerValue]) => [innerKey, innerValue || ''])
        ),
      ])
    );
  }
}
