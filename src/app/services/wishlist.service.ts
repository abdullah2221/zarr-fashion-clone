import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private static readonly STORAGE_KEY = 'ur_fashion_wishlist_v1';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private wishlistItems = signal<Product[]>(this.loadFromStorage());

  items = this.wishlistItems.asReadonly();
  count = computed(() => this.wishlistItems().length);

  constructor() {
    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem(WishlistService.STORAGE_KEY, JSON.stringify(this.wishlistItems()));
      }
    });
  }

  toggle(product: Product) {
    this.wishlistItems.update(items => {
      const exists = items.some(i => i.id === product.id);
      if (exists) {
        return items.filter(i => i.id !== product.id);
      }
      return [...items, product];
    });
  }

  isInWishlist(productId: number) {
    return this.wishlistItems().some(item => item.id === productId);
  }

  clear() {
    this.wishlistItems.set([]);
  }

  private loadFromStorage(): Product[] {
    try {
      if (!this.isBrowser) return [];
      const raw = localStorage.getItem(WishlistService.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
