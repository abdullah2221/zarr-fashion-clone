export interface SitePageSection {
  id: string;
  sectionType: string;
  content: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
}

export interface SitePageContent {
  slug: string;
  title: string;
  sections: SitePageSection[];
}

export interface StorefrontBrandMark {
  name: string;
  styleKey: string;
  /** Optional tile link (Phase 8 brands records). Absent = plain wordmark, as before. */
  linkUrl?: string;
}

export interface StorefrontStatItem {
  value: string;
  label: string;
}

export interface StorefrontBrandsStatsContent {
  brands: StorefrontBrandMark[];
  statsEyebrow: string;
  statsItems: StorefrontStatItem[];
  statsBackgroundPath: string;
  statsBackgroundAlt: string;
}

export interface StorefrontTestimonialItem {
  quote: string;
  author: string;
}

export interface StorefrontTestimonialsContent {
  eyebrow: string;
  title: string;
  items: StorefrontTestimonialItem[];
}

export interface StorefrontFaqItem {
  id: string;
  question: string;
  answer: string;
}

/** A testimonials-table record as the storefront renders it (Phase 7). */
export interface StorefrontTestimonialRecord {
  id: string;
  name: string;
  designation: string | null;
  body: string;
  rating: number | null;
}

/** Payload of the builder's generic 'custom-content' block (Phase 7). */
export interface StorefrontCustomContent {
  heading: string;
  body: string;
  imagePath?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface StorefrontNewsletterContent {
  eyebrow: string;
  heading: string;
  emailPlaceholder: string;
  buttonText: string;
  note: string;
}

export interface StorefrontStaticContent {
  eyebrow: string;
  intro: string;
  icon: string;
  ctaText?: string;
  ctaLink?: string;
  formType?: string;
  sections: Array<{ title: string; body: string; icon?: string }>;
  secondary?: Array<{ label: string; value: string }>;
}

export const DEFAULT_BRANDS_STATS: StorefrontBrandsStatsContent = {
  brands: [
    { name: 'SAHAR', styleKey: 'sahar' },
    { name: 'Neeshay', styleKey: 'neeshay' },
    { name: 'BURAQ', styleKey: 'buraq' },
    { name: 'YARDS', styleKey: 'yards' },
    { name: 'AZURE', styleKey: 'azure' },
    { name: 'SADAF FAWAD KHAN', styleKey: 'sadaf' },
    { name: 'Nainah', styleKey: 'nainah' },
    { name: 'KOEL', styleKey: 'koel' },
    { name: 'naya dour', styleKey: 'naya-dour' },
    { name: 'MUSHQ', styleKey: 'mushq' },
  ],
  statsEyebrow: 'BUY OVER',
  statsItems: [{ value: '50,000+', label: 'PRODUCTS' }],
  statsBackgroundPath: 'sections/stats-band-bg.jpg',
  statsBackgroundAlt: 'Draped ivory and gold embroidered fabrics in a warm atelier',
};

export const DEFAULT_TESTIMONIALS: StorefrontTestimonialsContent = {
  eyebrow: 'Loved by shoppers',
  title: 'Premium fashion with the trust Pakistani customers expect.',
  items: [
    { quote: '“The Eid suit arrived beautifully packed and exactly like the photos. COD made ordering easy.”', author: 'Ayesha, Lahore' },
    { quote: '“Fast delivery to Islamabad and the fabric quality felt premium for the price.”', author: 'Maham, Islamabad' },
    { quote: '“The lawn edit is easy to browse on mobile. I found sizes and offers quickly.”', author: 'Sana, Karachi' },
  ],
};

export const DEFAULT_NEWSLETTER: StorefrontNewsletterContent = {
  eyebrow: 'First access',
  heading: 'Get Eid drops, lawn launches and sale alerts first.',
  emailPlaceholder: 'Enter your email address',
  buttonText: 'Notify Me',
  note: 'No clutter. Just curated Zeenat updates for new arrivals, COD offers and seasonal campaigns.',
};

export const DEFAULT_SALE_SIDE_BANNER = {
  sideBannerTitle: 'Shop the Sale For Her',
  sideBannerText: "Your favorite looks, now at can't-miss prices — shop chic pieces before they're gone!",
};

/**
 * The homepage composition used until the phase-7 site_pages /
 * page_sections records load (and as the permanent fallback when
 * the CMS is unreachable). It mirrors the seeded records exactly:
 * same section types, same order, same payload copy.
 */
export const DEFAULT_HOME_SECTIONS: SitePageSection[] = [
  { id: 'default-hero', sectionType: 'hero', content: {}, sortOrder: 10, isActive: true },
  { id: 'default-pulse-marquee', sectionType: 'pulse-marquee', content: {}, sortOrder: 20, isActive: true },
  { id: 'default-trust-strip', sectionType: 'trust-strip', content: {}, sortOrder: 30, isActive: true },
  { id: 'default-collection-tags', sectionType: 'collection-tags', content: {}, sortOrder: 40, isActive: true },
  { id: 'default-category-scroll', sectionType: 'category-scroll', content: {}, sortOrder: 50, isActive: true },
  { id: 'default-featured-collections', sectionType: 'featured-collections', content: {}, sortOrder: 60, isActive: true },
  { id: 'default-campaign-band', sectionType: 'campaign-band', content: {}, sortOrder: 70, isActive: true },
  { id: 'default-carousel-popular', sectionType: 'carousel-popular', content: {}, sortOrder: 80, isActive: true },
  { id: 'default-carousel-sale', sectionType: 'carousel-sale', content: { ...DEFAULT_SALE_SIDE_BANNER }, sortOrder: 90, isActive: true },
  { id: 'default-testimonials', sectionType: 'testimonials', content: { ...DEFAULT_TESTIMONIALS }, sortOrder: 100, isActive: true },
  { id: 'default-brands-stats', sectionType: 'brands-stats', content: { ...DEFAULT_BRANDS_STATS }, sortOrder: 110, isActive: true },
  { id: 'default-offers', sectionType: 'offers', content: {}, sortOrder: 120, isActive: true },
  { id: 'default-campaign-cards', sectionType: 'campaign-cards', content: {}, sortOrder: 130, isActive: true },
  { id: 'default-support-band', sectionType: 'support-band', content: {}, sortOrder: 140, isActive: true },
  { id: 'default-newsletter', sectionType: 'newsletter', content: { ...DEFAULT_NEWSLETTER }, sortOrder: 150, isActive: true },
];
