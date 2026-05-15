import { Injectable, signal } from '@angular/core';
import { Product } from '../shared/models/models';
import { POPULAR_PRODUCTS, SALE_PRODUCTS, PRODUCTS } from '../data/data';

export type ProductSortBy =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'rating-high'
  | 'newest';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<Product[]>(PRODUCTS);
  private popularProductsSignal = signal<Product[]>(POPULAR_PRODUCTS);
  private saleProductsSignal = signal<Product[]>(SALE_PRODUCTS);

  getProducts() {
    return this.productsSignal.asReadonly();
  }

  getPopularProducts() {
    return this.popularProductsSignal.asReadonly();
  }

  getSaleProducts() {
    return this.saleProductsSignal.asReadonly();
  }

  getProductById(id: number) {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductsByCategory(slug: string) {
    const normalized = slug.toLowerCase().trim();
    return this.productsSignal().filter(p =>
      p.categorySlug === normalized ||
      p.category?.toLowerCase().replace(/\s+/g, '-') === normalized
    );
  }

  queryProducts(options: {
    categorySlug?: string;
    search?: string;
    sortBy?: ProductSortBy;
  }) {
    const search = (options.search || '').toLowerCase().trim();
    const sortBy = options.sortBy || 'featured';

    let list = [...this.productsSignal()];

    if (options.categorySlug) {
      list = this.getProductsByCategory(options.categorySlug);
    }

    if (search) {
      list = list.filter(product => {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          product.collection,
          ...(product.campaignTags || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => this.getPriceValue(a) - this.getPriceValue(b));
        break;
      case 'price-high':
        list.sort((a, b) => this.getPriceValue(b) - this.getPriceValue(a));
        break;
      case 'rating-high':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.id - a.id);
        break;
      default:
        list.sort((a, b) => {
          const scoreA = this.featuredScore(a);
          const scoreB = this.featuredScore(b);
          return scoreB - scoreA;
        });
        break;
    }

    return list;
  }

  private getPriceValue(product: Product) {
    if (typeof product.priceValue === 'number') return product.priceValue;
    return parseFloat(product.price.replace(/[^\d.]/g, '')) || 0;
  }

  private featuredScore(product: Product) {
    return (
      (product.isTrending ? 6 : 0) +
      (product.isNew ? 4 : 0) +
      (product.discount ? 3 : 0) +
      (product.badge === 'Best Seller' ? 5 : 0) +
      ((product.rating || 0) / 2)
    );
  }
}
