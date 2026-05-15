import { Session, User } from '@supabase/supabase-js';
import { Inserts, Tables, Updates } from '../models/database.types';

export interface AuthRepository {
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<User | null>;
  signInWithPassword(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

export interface ProductRepository {
  listActive(): Promise<Tables<'products'>[]>;
  getBySlug(slug: string): Promise<Tables<'products'> | null>;
  getImages(productId: string): Promise<Tables<'product_images'>[]>;
}

export interface CategoryRepository {
  listActive(): Promise<Tables<'categories'>[]>;
  getBySlug(slug: string): Promise<Tables<'categories'> | null>;
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
  uploadProductImage(path: string, file: File): Promise<string>;
}

export interface AdminRepository {
  listSettings(): Promise<Tables<'admin_settings'>[]>;
  updateSetting(key: string, changes: Updates<'admin_settings'>): Promise<Tables<'admin_settings'>>;
}
