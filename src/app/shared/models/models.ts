export interface Product {
  id: number;
  brand: string;
  name: string;
  price: string;
  priceValue?: number;
  originalPrice?: string;
  originalPriceValue?: number;
  discount?: string;
  imageUrl: string;
  image?: string;
  hoverImageUrl: string;
  url: string;
  category?: string;
  categorySlug: string;
  collection?: 'Eid' | 'Ramadan' | 'Summer Lawn' | 'Winter' | 'Wedding' | 'Ready to Wear' | 'Unstitched' | 'Stitched' | 'Sale';
  description?: string;
  rating?: number;
  reviewCount?: number;
  sizes?: string[];
  badge?: 'New' | 'Trending' | 'Best Seller' | 'Limited Stock';
  stockLabel?: string;
  isNew?: boolean;
  isTrending?: boolean;
  campaignTags?: string[];
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  eyebrow?: string;
  description?: string;
  secondaryCtaText?: string;
  campaignTag?: string;
}

export interface Category {
  id: string;
  slug?: string;
  name: string;
  imageUrl: string;
  subtitle?: string;
}
