import { Injectable } from '@angular/core';
import { Product } from '../../shared/models/models';
import { PRODUCTS } from '../../data/data';

export interface LocalCartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class LocalCartRepository {
  private static readonly STORAGE_KEY = 'ur_fashion_cart_v1';

  load(): LocalCartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LocalCartRepository.STORAGE_KEY);
      return raw ? JSON.parse(raw) as LocalCartItem[] : [];
    } catch {
      return [];
    }
  }

  save(items: LocalCartItem[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LocalCartRepository.STORAGE_KEY, JSON.stringify(items));
    }
  }
}

@Injectable({ providedIn: 'root' })
export class LocalWishlistRepository {
  private static readonly STORAGE_KEY = 'ur_fashion_wishlist_v1';

  load(): Product[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LocalWishlistRepository.STORAGE_KEY);
      return raw ? JSON.parse(raw) as Product[] : [];
    } catch {
      return [];
    }
  }

  save(items: Product[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LocalWishlistRepository.STORAGE_KEY, JSON.stringify(items));
    }
  }
}

@Injectable({ providedIn: 'root' })
export class LocalProductRepository {
  list(): Product[] {
    return PRODUCTS;
  }

  getById(id: number): Product | undefined {
    return PRODUCTS.find(product => product.id === id);
  }
}
