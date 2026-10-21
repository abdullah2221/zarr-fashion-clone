import { HeroSlide } from './models';

export interface StorefrontTrustBadge {
  icon: string;
  label: string;
  detail?: string;
}

export interface StorefrontCampaignCard {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  linkUrl: string;
  ctaText?: string;
  campaignType?: string;
  placement: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  tag?: string;
}

export interface StorefrontBannerExtra {
  description?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  placement?: string;
  campaignType?: string;
}

export interface StorefrontSocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

export interface StorefrontSettings {
  storeName: string;
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  deliveryMessage: string;
  codMessage: string;
  exchangePolicySummary: string;
  socialLinks: StorefrontSocialLinks;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  campaignChips: string[];
  trustBadges: StorefrontTrustBadge[];
  contactPageIntro?: string;
  aboutPageIntro?: string;
  faqIntro?: string;
  privacySummary?: string;
  termsSummary?: string;
  returnExchangeSummary?: string;
  bannerOverrides: Record<string, StorefrontBannerExtra>;
}

export interface StorefrontContentState {
  heroSlides: HeroSlide[];
  homeCampaigns: StorefrontCampaignCard[];
  offerCampaigns: StorefrontCampaignCard[];
  shopBanner: StorefrontCampaignCard | null;
  settings: StorefrontSettings;
}
