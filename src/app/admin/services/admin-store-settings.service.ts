import { Injectable, inject, signal } from '@angular/core';
import { SupabaseAdminRepository } from '../../data-access/supabase/supabase.repositories';
import { StorefrontContentService } from '../../services/storefront-content.service';
import { AdminStoreSettingsFormValue } from '../models/admin-marketing.models';
import { Json } from '../../data-access/models/database.types';
import { StorefrontFooterLinkColumn, StorefrontNavLink } from '../../shared/models/storefront-content.models';

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
        deliveryFee: settings.deliveryFee ?? 0,
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
        headerNavText: this.serializeNavLinks(settings.headerNavLinks),
        mobileNavText: this.serializeNavLinks(settings.mobileNavLinks),
        footerColumnsText: this.serializeFooterColumns(settings.footerLinkColumns),
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
      deliveryFee: value.deliveryFee ?? 0,
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
      headerNavLinks: this.parseNavLinks(value.headerNavText) as unknown as Json,
      mobileNavLinks: this.parseNavLinks(value.mobileNavText) as unknown as Json,
      footerLinkColumns: this.parseFooterColumns(value.footerColumnsText) as unknown as Json,
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

  // ---- Menu builder (Phase 7) -------------------------------------------
  // Nav link lines: "Label | URL" plus an optional third segment with
  // comma-separated flags: `active` marks the router-active link,
  // `highlight` gives the link its campaign/sale styling.

  private serializeNavLinks(links: StorefrontNavLink[]): string {
    return links
      .map(link => {
        const flags = [link.active ? 'active' : '', link.highlight ? 'highlight' : ''].filter(Boolean).join(', ');
        return flags ? `${link.label} | ${link.url} | ${flags}` : `${link.label} | ${link.url}`;
      })
      .join('\n');
  }

  private parseNavLinks(text: string): StorefrontNavLink[] {
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [label = '', url = '', flags = ''] = line.split('|').map(part => part.trim());
        const link: StorefrontNavLink = { label, url };
        const flagList = flags.split(',').map(flag => flag.trim()).filter(Boolean);
        if (flagList.includes('active')) link.active = true;
        if (flagList.includes('highlight')) link.highlight = true;
        return link;
      })
      .filter(link => link.label && link.url);
  }

  private serializeFooterColumns(columns: StorefrontFooterLinkColumn[]): string {
    return columns
      .map(column => [`# ${column.title}`, ...column.links.map(link => `${link.label} | ${link.url}`)].join('\n'))
      .join('\n\n');
  }

  private parseFooterColumns(text: string): StorefrontFooterLinkColumn[] {
    const columns: StorefrontFooterLinkColumn[] = [];
    let current: StorefrontFooterLinkColumn | null = null;
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith('#')) {
        current = { title: line.replace(/^#+\s*/, '').trim(), links: [] };
        columns.push(current);
        continue;
      }
      if (!current) {
        current = { title: 'Links', links: [] };
        columns.push(current);
      }
      const [label = '', url = ''] = line.split('|').map(part => part.trim());
      if (label && url) current.links.push({ label, url });
    }
    return columns.filter(column => column.title && column.links.length);
  }
}
