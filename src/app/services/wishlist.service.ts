import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../shared/models/models';
import { SupabaseWishlistRepository } from '../data-access/supabase/supabase.repositories';
import { ProductService } from './product.service';
import { AdminSessionService } from './admin-session.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private static readonly STORAGE_KEY = 'ur_fashion_wishlist_v1';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly wishlistRepo = inject(SupabaseWishlistRepository);
  private readonly productService = inject(ProductService);
  private readonly session = inject(AdminSessionService);

  private readonly wishlistItems = signal<Product[]>(this.loadFromStorage());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private lastSyncedUserId: string | null = null;

  readonly items = this.wishlistItems.asReadonly();
  readonly count = computed(() => this.wishlistItems().length);
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      localStorage.setItem(WishlistService.STORAGE_KEY, JSON.stringify(this.wishlistItems()));
    });

    if (this.isBrowser) {
      void this.session.ensureInitialized();
      effect(() => {
        const user = this.session.user();
        const isLoggedIn = this.session.isLoggedIn();
        if (!isLoggedIn || !user) {
          this.lastSyncedUserId = null;
          this.wishlistItems.set(this.loadFromStorage());
          return;
        }
        if (this.lastSyncedUserId === user.id) return;
        this.lastSyncedUserId = user.id;
        void this.syncAfterLogin();
      });
    }
  }

  async toggle(product: Product) {
    this.errorSignal.set(null);
    const exists = this.wishlistItems().some(item => item.id === product.id);
    this.wishlistItems.update(items => exists ? items.filter(item => item.id !== product.id) : [...items, product]);

    if (!this.session.isLoggedIn() || !this.session.user()) return;
    if (!product.catalogId) return;

    try {
      if (exists) {
        await this.wishlistRepo.remove(product.catalogId);
      } else {
        await this.wishlistRepo.add(product.catalogId);
      }
    } catch (error) {
      // Revert optimistic update on failure.
      this.wishlistItems.update(items => exists ? [...items, product] : items.filter(item => item.id !== product.id));
      this.errorSignal.set(error instanceof Error ? error.message : 'Unable to update wishlist right now.');
    }
  }

  isInWishlist(productId: number) {
    return this.wishlistItems().some(item => item.id === productId);
  }

  clear() {
    this.wishlistItems.set([]);
  }

  private async syncAfterLogin() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const localItems = this.loadFromStorage();
      for (const item of localItems) {
        if (!item.catalogId) continue;
        try {
          await this.wishlistRepo.add(item.catalogId);
        } catch {
          // Ignore duplicate insert errors to preserve idempotent sync.
        }
      }

      const remoteItems = await this.wishlistRepo.listMine();
      let catalogProducts = this.productService.getProducts()();
      if (!catalogProducts.length || this.productService.isLoading()) {
        await this.productService.refreshCatalog();
        catalogProducts = this.productService.getProducts()();
      }

      const catalogById = new Map(catalogProducts.map(product => [product.catalogId, product]));
      const merged = remoteItems
        .map(row => catalogById.get(row.product_id) || null)
        .filter((product): product is Product => Boolean(product));

      this.wishlistItems.set(this.uniqueByLegacyId(merged));
    } catch (error) {
      this.errorSignal.set(error instanceof Error ? error.message : 'Unable to sync wishlist.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private uniqueByLegacyId(items: Product[]) {
    const map = new Map<number, Product>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return [...map.values()];
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
