import { Injectable, signal } from '@angular/core';
import { Product } from '../shared/models/models';
import { POPULAR_PRODUCTS, SALE_PRODUCTS, PRODUCTS } from '../data/data';

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

  getProductsByCategory(category: string) {
    return this.productsSignal().filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }
}
