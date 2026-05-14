import { Product, HeroSlide, Category } from '../shared/models/models';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000',
    title: 'THE NEW ELEGANCE',
    subtitle: 'Autumn / Winter Collection',
    ctaText: 'SHOP THE COLLECTION'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1618932260643-ee4e9c6c3985?auto=format&fit=crop&q=80&w=2000',
    title: 'URBAN NOMAD',
    subtitle: 'Everyday Essentials redefined.',
    ctaText: 'DISCOVER MORE'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000',
    title: 'EVENING GLAMOUR',
    subtitle: 'Shine in the spotlight.',
    ctaText: 'SHOP EVENING WEAR'
  }
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'READY TO WEAR', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600' },
  { id: '2', name: 'UNSTITCHED', imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=600' },
  { id: '3', name: 'WESTERN', imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600' },
  { id: '4', name: 'MODEST WEAR', imageUrl: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=600' },
  { id: '5', name: 'FRAGRANCES', imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
  { id: '6', name: 'LOUNGEWEAR', imageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=600' },
  { id: '7', name: 'FOOTWEAR', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600' },
  { id: '8', name: 'ACCESSORIES', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600' },
];

export const FEATURED_COLLECTIONS = [
  { id: 1, name: 'Sahar - Festive', brand: 'SAHAR', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'La Toscana', brand: 'MUSHQ', imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Mahay Spring\'26', brand: 'SANA SAFINAZ', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Luxury Lawn \'26', brand: 'SADAF FAWAD KHAN', imageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&fit=crop&q=80&w=600' }
];

export const POPULAR_PRODUCTS: Product[] = [
  {
    id: 11,
    brand: 'INSIGNIA',
    name: 'CASUAL SLIP ON IC017-BLACK',
    price: 'Rs. 5,450',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 12,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED MAHAY LAWN 3 PIECE SUIT',
    price: 'Rs. 4,499',
    imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 13,
    brand: 'J.',
    name: 'OFF WHITE LAWN EMBROIDERED 3P',
    price: 'Rs. 6,490',
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 14,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED 3 PIECE LAWN SUIT',
    price: 'Rs. 4,499',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 15,
    brand: 'SANA SAFINAZ',
    name: 'PRINTED MAXI DRESS',
    price: 'Rs. 7,999',
    imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=600',
    url: '#'
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
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 22,
    brand: 'naya dour',
    name: 'CANVAS PATCH POCKET SHACKET',
    price: 'Rs. 4,485',
    originalPrice: 'Rs. 14,950',
    discount: '-70%',
    imageUrl: 'https://images.unsplash.com/photo-1618932260643-ee4e9c6c3985?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 23,
    brand: 'INSIGNIA',
    name: 'FORMAL COURT SHOES #S066-PLUM',
    price: 'Rs. 5,725',
    originalPrice: 'Rs. 11,450',
    discount: '-50%',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 24,
    brand: 'SANA SAFINAZ',
    name: 'UNSTITCHED MUZLIN LAWN 3 PIECE SUIT',
    price: 'Rs. 5,360',
    originalPrice: 'Rs. 6,699',
    discount: '-19%',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&q=80&w=600',
    url: '#'
  },
  {
    id: 25,
    brand: 'Ismail\'s',
    name: 'PRINTED MAXI DRESS',
    price: 'Rs. 3,750',
    originalPrice: 'Rs. 7,499',
    discount: '-49%',
    imageUrl: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=600',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=600',
    url: '#'
  }
];

export const PRODUCTS: Product[] = [...POPULAR_PRODUCTS, ...SALE_PRODUCTS];
