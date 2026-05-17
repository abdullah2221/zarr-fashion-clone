import { Session, User } from '@supabase/supabase-js';
import { Inserts, Tables, Updates } from '../models/database.types';

export interface AuthRepository {
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<User | null>;
  signInWithPassword(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

export interface ProfileRepository {
  getCurrent(): Promise<Tables<'profiles'> | null>;
  updateCurrent(changes: Updates<'profiles'>): Promise<Tables<'profiles'>>;
  isAdmin(): Promise<boolean>;
  isSuperAdmin(): Promise<boolean>;
}

export interface ProductRepository {
  listActive(): Promise<Tables<'products'>[]>;
  listAll(): Promise<Tables<'products'>[]>;
  getById(id: string): Promise<Tables<'products'> | null>;
  getBySlug(slug: string): Promise<Tables<'products'> | null>;
  getImages(productId: string): Promise<Tables<'product_images'>[]>;
  createImage(image: Inserts<'product_images'>): Promise<Tables<'product_images'>>;
  updateImage(id: string, changes: Updates<'product_images'>): Promise<Tables<'product_images'>>;
  deleteImage(id: string): Promise<void>;
  create(product: Inserts<'products'>): Promise<Tables<'products'>>;
  update(id: string, changes: Updates<'products'>): Promise<Tables<'products'>>;
  delete(id: string): Promise<void>;
}

export interface CategoryRepository {
  listActive(): Promise<Tables<'categories'>[]>;
  listAll(): Promise<Tables<'categories'>[]>;
  getById(id: string): Promise<Tables<'categories'> | null>;
  getBySlug(slug: string): Promise<Tables<'categories'> | null>;
  create(category: Inserts<'categories'>): Promise<Tables<'categories'>>;
  update(id: string, changes: Updates<'categories'>): Promise<Tables<'categories'>>;
  delete(id: string): Promise<void>;
}

export interface BannerRepository {
  listActive(): Promise<Tables<'banners'>[]>;
  listAll(): Promise<Tables<'banners'>[]>;
  getById(id: string): Promise<Tables<'banners'> | null>;
  create(banner: Inserts<'banners'>): Promise<Tables<'banners'>>;
  update(id: string, changes: Updates<'banners'>): Promise<Tables<'banners'>>;
  delete(id: string): Promise<void>;
}

export interface CampaignRepository {
  listActive(): Promise<Tables<'campaigns'>[]>;
  listAll(): Promise<Tables<'campaigns'>[]>;
  getById(id: string): Promise<Tables<'campaigns'> | null>;
  create(campaign: Inserts<'campaigns'>): Promise<Tables<'campaigns'>>;
  update(id: string, changes: Updates<'campaigns'>): Promise<Tables<'campaigns'>>;
  delete(id: string): Promise<void>;
}

export interface OrderRepository {
  create(order: Inserts<'orders'>, items: Omit<Inserts<'order_items'>, 'order_id'>[]): Promise<Tables<'orders'>>;
  listMine(): Promise<Tables<'orders'>[]>;
}

export interface WishlistRepository {
  listMine(): Promise<Tables<'wishlist_items'>[]>;
  add(productId: string): Promise<Tables<'wishlist_items'>>;
  remove(productId: string): Promise<void>;
}

export interface FeedbackRepository {
  submit(feedback: Inserts<'feedback'>): Promise<Tables<'feedback'>>;
}

export interface StorageRepository {
  getProductImageUrl(path: string): string;
  uploadProductImage(path: string, file: File, options?: { upsert?: boolean }): Promise<string>;
  removeProductImage(path: string): Promise<void>;
  getPublicImageUrl(path: string): string;
  uploadPublicImage(path: string, file: File, options?: { upsert?: boolean }): Promise<string>;
  removePublicImage(path: string): Promise<void>;
}

export interface AdminRepository {
  listSettings(): Promise<Tables<'admin_settings'>[]>;
  getSetting(key: string): Promise<Tables<'admin_settings'> | null>;
  updateSetting(key: string, changes: Updates<'admin_settings'>): Promise<Tables<'admin_settings'>>;
  upsertSetting(setting: Inserts<'admin_settings'>): Promise<Tables<'admin_settings'>>;
  deleteSetting(key: string): Promise<void>;
}
