export interface AdminSectionTypeInfo {
  type: string;
  label: string;
  /**
   * Plain-language explanation of what visitors see, shown under the
   * section-type dropdown and in the section list. Written for a
   * non-developer: no code words, no internal names.
   */
  description: string;
  /**
   * Where this section's inner content is managed when it is NOT a
   * payload of the section itself. Null means the section carries
   * its own editable content fields in the Pages editor.
   */
  contentOwner: string | null;
}

export const ADMIN_SECTION_TYPES: AdminSectionTypeInfo[] = [
  { type: 'hero', label: 'Hero slider', description: 'The big sliding banners at the top of the homepage.', contentOwner: 'Admin > Campaigns (hero banners)' },
  { type: 'pulse-marquee', label: 'Trending marquee', description: 'The scrolling line of short announcements under the hero.', contentOwner: 'Admin > Settings (campaign chips)' },
  { type: 'trust-strip', label: 'Trust strip', description: 'The small row of promises under the hero, e.g. free delivery and cash on delivery.', contentOwner: 'Admin > Settings (trust badges)' },
  { type: 'collection-tags', label: 'Collection tags', description: 'Small clickable tags above the categories, e.g. Summer Lawn.', contentOwner: 'Admin > Settings (campaign chips)' },
  { type: 'category-scroll', label: 'Category scroll', description: 'The row of shop categories on the homepage, e.g. Unstitched and Ready to Wear.', contentOwner: 'Admin > Categories' },
  { type: 'featured-collections', label: 'Featured collections', description: 'The seasonal collection tiles on the homepage. If no tile is active, this whole section hides itself.', contentOwner: 'Admin > Campaigns (placement: Featured collections)' },
  { type: 'campaign-band', label: 'Campaign band', description: 'A wide banner strip. If no banner is active for it, this section hides itself.', contentOwner: 'Admin > Campaigns (placement: Shop banner)' },
  { type: 'carousel-popular', label: 'Product carousel — Popular', description: 'The "Popular Right Now" product row.', contentOwner: 'Admin > Products' },
  { type: 'carousel-sale', label: 'Product carousel — On Sale', description: 'The "On Sale Right Now" product row, with your own side banner text.', contentOwner: null },
  { type: 'testimonials', label: 'Testimonials', description: 'Customer quotes. With no active quote, this section hides itself.', contentOwner: 'Admin > Testimonials (heading edited here)' },
  { type: 'faq-list', label: 'FAQ list', description: 'Questions and answers. With no active question, this section hides itself.', contentOwner: 'Admin > FAQs (heading edited here)' },
  { type: 'custom-content', label: 'Custom content', description: 'Your own heading, text, image and button — for any message you want on a page.', contentOwner: null },
  { type: 'brands-stats', label: 'Brands + stats band', description: 'The brand names strip and the numbers band underneath it.', contentOwner: null },
  { type: 'offers', label: 'Offers grid', description: 'The sale and offer cards on the homepage. If none is active, this section hides itself.', contentOwner: 'Admin > Campaigns (placement: Offer grid)' },
  { type: 'campaign-cards', label: 'Campaign cards', description: 'Campaign cards on the homepage. If none is active, this section hides itself.', contentOwner: 'Admin > Campaigns (placement: Home section)' },
  { type: 'support-band', label: 'Support band', description: 'The help and contact strip.', contentOwner: 'Admin > Settings (store messages)' },
  { type: 'newsletter', label: 'Newsletter band', description: 'The email sign-up box. Sign-ups appear in Admin > Subscribers.', contentOwner: null },
  { type: 'static-content', label: 'Page content', description: 'Text, cards and info rows for pages like About, Contact and FAQ.', contentOwner: null },
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
  return ADMIN_SECTION_TYPES.find(item => item.type === type) || { type, label: type, description: '', contentOwner: null };
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
