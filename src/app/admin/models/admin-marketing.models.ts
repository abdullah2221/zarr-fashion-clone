import { Tables } from '../../data-access/models/database.types';
import { StorefrontSettings } from '../../shared/models/storefront-content.models';

export type AdminCampaignPlacement =
  | 'home-hero'
  | 'home-section'
  | 'shop-banner'
  | 'product-badge'
  | 'footer-chip'
  | 'offer-grid'
  | 'featured-collections';

export interface AdminBannerEditorValue {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  campaignType: string;
  placement: AdminCampaignPlacement;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number | null;
  startDate: string;
  endDate: string;
}

export interface AdminCampaignEditorValue {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  imagePath?: string | null;
  linkUrl: string;
  ctaText: string;
  campaignType: string;
  placement: AdminCampaignPlacement;
  active: boolean;
  sortOrder: number | null;
  startDate: string;
  endDate: string;
  tag: string;
}

export interface AdminBannerListItem {
  record: Tables<'banners'>;
  imageUrl: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  placement: AdminCampaignPlacement;
  campaignType: string;
}

export interface AdminCampaignListItem {
  record: Tables<'campaigns'>;
  imageUrl?: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  ctaText: string;
  placement: AdminCampaignPlacement;
  campaignType: string;
  sortOrder: number;
  tag: string;
}

export interface AdminStoreSettingsFormValue extends Omit<StorefrontSettings, 'bannerOverrides' | 'campaignChips' | 'trustBadges' | 'socialLinks'> {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  campaignChipsText: string;
  trustBadgesText: string;
}
