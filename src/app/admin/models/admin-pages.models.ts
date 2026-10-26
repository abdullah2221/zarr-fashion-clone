export interface AdminSectionTypeInfo {
  type: string;
  label: string;
  /**
   * Where this section's inner content is managed when it is NOT a
   * payload of the section itself. Null means the section carries
   * its own editable content fields in the Pages editor.
   */
  contentOwner: string | null;
}

export const ADMIN_SECTION_TYPES: AdminSectionTypeInfo[] = [
  { type: 'hero', label: 'Hero slider', contentOwner: 'Admin > Campaigns (hero banners)' },
  { type: 'pulse-marquee', label: 'Trending marquee', contentOwner: 'Admin > Settings (campaign chips)' },
  { type: 'trust-strip', label: 'Trust strip', contentOwner: 'Admin > Settings (trust badges)' },
  { type: 'collection-tags', label: 'Collection tags', contentOwner: 'Admin > Settings (campaign chips)' },
  { type: 'category-scroll', label: 'Category scroll', contentOwner: 'Admin > Categories' },
  { type: 'featured-collections', label: 'Featured collections', contentOwner: 'Admin > Campaigns (placement: Featured collections)' },
  { type: 'campaign-band', label: 'Campaign band', contentOwner: 'Admin > Campaigns (placement: Shop banner)' },
  { type: 'carousel-popular', label: 'Product carousel — Popular', contentOwner: 'Admin > Products' },
  { type: 'carousel-sale', label: 'Product carousel — On Sale', contentOwner: null },
  { type: 'testimonials', label: 'Testimonials', contentOwner: 'Admin > Testimonials (heading edited here)' },
  { type: 'faq-list', label: 'FAQ list', contentOwner: 'Admin > FAQs (heading edited here)' },
  { type: 'custom-content', label: 'Custom content', contentOwner: null },
  { type: 'brands-stats', label: 'Brands + stats band', contentOwner: null },
  { type: 'offers', label: 'Offers grid', contentOwner: 'Admin > Campaigns (placement: Offer grid)' },
  { type: 'campaign-cards', label: 'Campaign cards', contentOwner: 'Admin > Campaigns (placement: Home section)' },
  { type: 'support-band', label: 'Support band', contentOwner: 'Admin > Settings (store messages)' },
  { type: 'newsletter', label: 'Newsletter band', contentOwner: null },
  { type: 'static-content', label: 'Page content', contentOwner: null },
];

export const PAYLOAD_SECTION_TYPES = ['carousel-sale', 'testimonials', 'brands-stats', 'newsletter', 'static-content', 'faq-list', 'custom-content'];

/**
 * Section types that pull a LIST from another source and therefore
 * honour the optional payload `limit` (Phase 7). The Pages editor
 * shows the limit field for exactly these types — no dead fields.
 */
export const LIMITABLE_SECTION_TYPES = [
  'category-scroll',
  'featured-collections',
  'carousel-popular',
  'carousel-sale',
  'offers',
  'campaign-cards',
  'faq-list',
];

export function sectionTypeInfo(type: string): AdminSectionTypeInfo {
  return ADMIN_SECTION_TYPES.find(item => item.type === type) || { type, label: type, contentOwner: null };
}

export interface AdminSectionEditorValue {
  sectionType: string;
  sortOrder: number | null;
  isActive: boolean;
  // Shared text fields (testimonials / newsletter / static-content)
  eyebrow: string;
  title: string;
  // carousel-sale
  sideBannerTitle: string;
  sideBannerText: string;
  // testimonials — one "Quote | Author" per line
  itemsText: string;
  // brands-stats
  brandsText: string;
  statsEyebrow: string;
  statsItemsText: string;
  statsBackgroundPath: string;
  statsBackgroundAlt: string;
  // newsletter
  heading: string;
  emailPlaceholder: string;
  buttonText: string;
  note: string;
  // static-content
  intro: string;
  icon: string;
  ctaText: string;
  ctaLink: string;
  formType: string;
  sectionsText: string;
  secondaryText: string;
  // Phase 7: optional per-section item limit for list-backed sections
  limit: number | null;
  // Phase 7: custom-content section
  body: string;
  imagePath: string;
  imageAlt: string;
}
