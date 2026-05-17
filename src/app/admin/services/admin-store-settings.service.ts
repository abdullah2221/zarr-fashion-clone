import { Injectable, inject, signal } from '@angular/core';
import { SupabaseAdminRepository } from '../../data-access/supabase/supabase.repositories';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { AdminStoreSettingsFormValue } from '../models/admin-marketing.models';
import { Json } from '../../data-access/models/database.types';

@Injectable({ providedIn: 'root' })
export class AdminStoreSettingsService {
  private readonly adminRepository = inject(SupabaseAdminRepository);
  private readonly storefront = inject(StorefrontContentService);

  private readonly loadingSignal = signal(false);
  readonly isLoading = this.loadingSignal.asReadonly();

  async loadFormValue(): Promise<AdminStoreSettingsFormValue> {
    this.loadingSignal.set(true);
    try {
      const settings = this.storefront.settings();
      return {
        storeName: settings.storeName,
        whatsappNumber: settings.whatsappNumber,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        deliveryMessage: settings.deliveryMessage,
        codMessage: settings.codMessage,
        exchangePolicySummary: settings.exchangePolicySummary,
        defaultSeoTitle: settings.defaultSeoTitle,
        defaultSeoDescription: settings.defaultSeoDescription,
        contactPageIntro: settings.contactPageIntro || '',
        aboutPageIntro: settings.aboutPageIntro || '',
        faqIntro: settings.faqIntro || '',
        privacySummary: settings.privacySummary || '',
        termsSummary: settings.termsSummary || '',
        returnExchangeSummary: settings.returnExchangeSummary || '',
        instagram: settings.socialLinks.instagram || '',
        facebook: settings.socialLinks.facebook || '',
        tiktok: settings.socialLinks.tiktok || '',
        youtube: settings.socialLinks.youtube || '',
        campaignChipsText: settings.campaignChips.join('\n'),
        trustBadgesText: settings.trustBadges.map(item => [item.icon, item.label, item.detail || ''].join('|')).join('\n'),
      };
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async save(value: AdminStoreSettingsFormValue) {
    const currentBannerOverrides = Object.fromEntries(
      Object.entries(this.storefront.settings().bannerOverrides).map(([bannerId, overrides]) => [
        bannerId,
        {
          description: overrides.description || '',
          ctaText: overrides.ctaText || '',
          secondaryCtaText: overrides.secondaryCtaText || '',
          placement: overrides.placement || '',
          campaignType: overrides.campaignType || '',
        },
      ])
    );

    const storefrontSettings: Record<string, Json> = {
      storeName: value.storeName,
      whatsappNumber: value.whatsappNumber,
      supportEmail: value.supportEmail,
      supportPhone: value.supportPhone,
      freeDeliveryThreshold: value.freeDeliveryThreshold,
      deliveryMessage: value.deliveryMessage,
      codMessage: value.codMessage,
      exchangePolicySummary: value.exchangePolicySummary,
      defaultSeoTitle: value.defaultSeoTitle,
      defaultSeoDescription: value.defaultSeoDescription,
      contactPageIntro: value.contactPageIntro || '',
      aboutPageIntro: value.aboutPageIntro || '',
      faqIntro: value.faqIntro || '',
      privacySummary: value.privacySummary || '',
      termsSummary: value.termsSummary || '',
      returnExchangeSummary: value.returnExchangeSummary || '',
      socialLinks: {
        instagram: value.instagram || '',
        facebook: value.facebook || '',
        tiktok: value.tiktok || '',
        youtube: value.youtube || '',
      },
      campaignChips: value.campaignChipsText.split(/\r?\n/).map(item => item.trim()).filter(Boolean),
      trustBadges: value.trustBadgesText.split(/\r?\n/).map(line => {
        const [icon, label, detail] = line.split('|').map(item => item.trim());
        return { icon, label, detail };
      }).filter(item => item.icon && item.label),
      bannerOverrides: currentBannerOverrides,
    };

    await this.adminRepository.upsertSetting({
      key: 'storefront_settings',
      value: storefrontSettings,
    });
    await this.storefront.refresh();
  }
}
