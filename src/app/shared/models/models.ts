export interface Product {
  id: number;
  brand: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  imageUrl: string;
  image?: string; // Alias for templates that use 'image'
  hoverImageUrl: string;
  url: string;
  category?: string;
  description?: string;
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}
