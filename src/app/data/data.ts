import { Product, HeroSlide, Category } from '../shared/models/models';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=2200',
    eyebrow: 'Festive Edit • Limited Drop',
    title: 'EID COLLECTION 2026',
    subtitle: 'Luxury formals, embroidered lawn and statement pret for every Eid gathering.',
    description: 'Celebrate in elevated silhouettes crafted for family dinners, chand raat moments and festive portraits.',
    ctaText: 'SHOP EID EDIT',
    secondaryCtaText: 'VIEW LOOKBOOK',
    campaignTag: 'New Arrivals'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=2200',
    eyebrow: 'Summer Lawn • Pakistan Ready',
    title: 'THE LAWN SEASON',
    subtitle: 'Breathable prints, soft palettes and everyday elegance for warm days.',
    description: 'Shop unstitched 2-piece and 3-piece edits made for heat, humidity and effortless styling.',
    ctaText: 'SHOP LAWN',
    secondaryCtaText: 'EXPLORE UNSTITCHED',
    campaignTag: 'Flat 30% Off'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=2200',
    eyebrow: 'Wedding Season • Evening Luxe',
    title: 'WEDDING WARDROBE',
    subtitle: 'Chiffon, organza and embellished looks for mehndi, baraat and walima nights.',
    description: 'Curated occasionwear with premium finishes, rich colour and timeless sparkle.',
    ctaText: 'SHOP WEDDING',
    secondaryCtaText: 'BEST SELLERS',
    campaignTag: 'Limited Stock'
  }
];

export const CATEGORIES: Category[] = [
  { id: '1', slug: 'unstitched', name: 'UNSTITCHED', subtitle: '2 & 3 piece suits', imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=700' },
  { id: '2', slug: 'ready-to-wear', name: 'READY TO WEAR', subtitle: 'Effortless pret', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700' },
  { id: '3', slug: 'lawn', name: 'SUMMER LAWN', subtitle: 'Light, breathable edits', imageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&fit=crop&q=80&w=700' },
  { id: '4', slug: 'eid-edit', name: 'LUXURY PRET', subtitle: 'Premium occasionwear', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=700' },
  { id: '5', slug: 'wedding', name: 'WEDDING', subtitle: 'Festive formals', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=700' },
  { id: '6', slug: 'stitched', name: 'MODEST WEAR', subtitle: 'Elegant coverage', imageUrl: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=700' },
  { id: '7', slug: 'footwear', name: 'FOOTWEAR', subtitle: 'Polished finish', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=700' },
  { id: '8', slug: 'sale', name: 'ACCESSORIES', subtitle: 'Complete the look', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=700' },
];

export const FEATURED_COLLECTIONS = [
  { id: 1, name: 'Eid Noor Festive', brand: 'UR-Fashion Atelier', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Summer Lawn Studio', brand: 'LAWN EDIT', imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Mehndi & Barat Picks', brand: 'WEDDING', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Azadi Green Edit', brand: '14 AUGUST', imageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&fit=crop&q=80&w=800' }
];

export const POPULAR_PRODUCTS: Product[] = [
  {
    id: 11,
    brand: 'INSIGNIA',
    name: 'CASUAL SLIP ON IC017-BLACK',
    price: 'Rs. 5,450',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Footwear',
    categorySlug: 'footwear',
    collection: 'Ready to Wear',
    rating: 4.7,
    reviewCount: 88,
    sizes: ['36', '37', '38', '39', '40'],
    badge: 'Trending',
    isTrending: true,
    stockLabel: 'Selling fast'
  },
  {
    id: 12,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED MAHAY LAWN 3 PIECE SUIT',
    price: 'Rs. 4,499',
    imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Unstitched',
    categorySlug: 'unstitched',
    collection: 'Unstitched',
    description: 'A breathable summer lawn suit with a soft printed palette and elegant seasonal detailing.',
    rating: 4.8,
    reviewCount: 143,
    sizes: ['Unstitched', '2 Pc', '3 Pc'],
    badge: 'Best Seller',
    stockLabel: 'Only 7 left'
  },
  {
    id: 13,
    brand: 'J.',
    name: 'OFF WHITE LAWN EMBROIDERED 3P',
    price: 'Rs. 6,490',
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Lawn',
    categorySlug: 'lawn',
    collection: 'Summer Lawn',
    rating: 4.6,
    reviewCount: 72,
    sizes: ['S', 'M', 'L'],
    badge: 'New',
    isNew: true
  },
  {
    id: 14,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED 3 PIECE LAWN SUIT',
    price: 'Rs. 4,499',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Unstitched',
    categorySlug: 'unstitched',
    collection: 'Unstitched',
    rating: 4.9,
    reviewCount: 214,
    sizes: ['Unstitched', '3 Pc'],
    badge: 'Limited Stock',
    stockLabel: 'Limited stock'
  },
  {
    id: 15,
    brand: 'UR-Fashion Studio',
    name: 'PRINTED MAXI DRESS',
    price: 'Rs. 7,999',
    imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Ready to Wear',
    categorySlug: 'ready-to-wear',
    collection: 'Ready to Wear',
    rating: 4.5,
    reviewCount: 51,
    sizes: ['XS', 'S', 'M', 'L'],
    badge: 'Trending',
    isTrending: true
  }
];

export const SALE_PRODUCTS: Product[] = [
  {
    id: 21,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED LINEN MUZLIN 2 PIECE SUIT',
    price: 'Rs. 5,850',
    originalPrice: 'Rs. 11,699',
    discount: '-49%',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Sale',
    categorySlug: 'sale',
    collection: 'Sale',
    rating: 4.7,
    reviewCount: 132,
    sizes: ['Unstitched', '2 Pc'],
    badge: 'Best Seller',
    stockLabel: 'Sale ends soon'
  },
  {
    id: 22,
    brand: 'naya dour',
    name: 'CANVAS PATCH POCKET SHACKET',
    price: 'Rs. 4,485',
    originalPrice: 'Rs. 14,950',
    discount: '-70%',
    imageUrl: 'https://images.unsplash.com/photo-1618932260643-ee4e9c6c3985?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Ready to Wear',
    categorySlug: 'ready-to-wear',
    collection: 'Ready to Wear',
    rating: 4.4,
    reviewCount: 39,
    sizes: ['S', 'M', 'L'],
    badge: 'Limited Stock',
    stockLabel: 'Only 3 left'
  },
  {
    id: 23,
    brand: 'INSIGNIA',
    name: 'FORMAL COURT SHOES #S066-PLUM',
    price: 'Rs. 5,725',
    originalPrice: 'Rs. 11,450',
    discount: '-50%',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Footwear',
    categorySlug: 'footwear',
    collection: 'Sale',
    rating: 4.6,
    reviewCount: 61,
    sizes: ['36', '37', '38', '39'],
    stockLabel: 'COD available'
  },
  {
    id: 24,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED MUZLIN LAWN 3 PIECE SUIT',
    price: 'Rs. 5,360',
    originalPrice: 'Rs. 6,699',
    discount: '-19%',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Lawn',
    categorySlug: 'lawn',
    collection: 'Summer Lawn',
    rating: 4.8,
    reviewCount: 97,
    sizes: ['Unstitched', '3 Pc'],
    badge: 'New',
    isNew: true
  },
  {
    id: 25,
    brand: 'Ismail\'s',
    name: 'PRINTED MAXI DRESS',
    price: 'Rs. 3,750',
    originalPrice: 'Rs. 7,499',
    discount: '-49%',
    imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=700',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=700',
    url: '#',
    category: 'Ready to Wear',
    categorySlug: 'ready-to-wear',
    collection: 'Ready to Wear',
    rating: 4.3,
    reviewCount: 45,
    sizes: ['XS', 'S', 'M'],
    stockLabel: 'Selling fast'
  }
];

export const PRODUCTS: Product[] = [...POPULAR_PRODUCTS, ...SALE_PRODUCTS];
