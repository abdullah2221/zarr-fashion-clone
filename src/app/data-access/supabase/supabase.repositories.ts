import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../../core/supabase/supabase-client.service';
import { Inserts, Tables, Updates } from '../models/database.types';
import {
  AdminRepository,
  AuthRepository,
  CategoryRepository,
  FeedbackRepository,
  OrderRepository,
  ProductRepository,
  StorageRepository,
  WishlistRepository,
} from '../repositories/repositories';

abstract class SupabaseRepositoryBase {
  protected readonly clientService = inject(SupabaseClientService);

  protected client() {
    const client = this.clientService.getClient();
    if (!client) throw new Error('Supabase is not configured.');
    return client;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseAuthRepository extends SupabaseRepositoryBase implements AuthRepository {
  async getSession() {
    const { data, error } = await this.client().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getCurrentUser() {
    const { data, error } = await this.client().auth.getUser();
    if (error) throw error;
    return data.user;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in succeeded without a user payload.');
    return data.user;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.client().auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up succeeded without a user payload.');
    return data.user;
  }

  async signOut() {
    const { error } = await this.client().auth.signOut();
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseProductRepository extends SupabaseRepositoryBase implements ProductRepository {
  async listActive() {
    const { data, error } = await this.client().from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.client().from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getImages(productId: string) {
    const { data, error } = await this.client().from('product_images').select('*').eq('product_id', productId).order('sort_order');
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseCategoryRepository extends SupabaseRepositoryBase implements CategoryRepository {
  async listActive() {
    const { data, error } = await this.client().from('categories').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.client().from('categories').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseOrderRepository extends SupabaseRepositoryBase implements OrderRepository {
  async create(order: Inserts<'orders'>, items: Omit<Inserts<'order_items'>, 'order_id'>[]) {
    const { data: createdOrder, error: orderError } = await this.client().from('orders').insert(order).select('*').single();
    if (orderError) throw orderError;

    const orderItems = items.map(item => ({ ...item, order_id: createdOrder.id }));
    const { error: itemsError } = await this.client().from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return createdOrder;
  }

  async listMine() {
    const { data, error } = await this.client().from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseWishlistRepository extends SupabaseRepositoryBase implements WishlistRepository {
  async listMine() {
    const { data, error } = await this.client().from('wishlist_items').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async add(productId: string) {
    const user = await this.currentUserId();
    const { data, error } = await this.client().from('wishlist_items').insert({ product_id: productId, user_id: user }).select('*').single();
    if (error) throw error;
    return data;
  }

  async remove(productId: string) {
    const user = await this.currentUserId();
    const { error } = await this.client().from('wishlist_items').delete().eq('product_id', productId).eq('user_id', user);
    if (error) throw error;
  }

  private async currentUserId() {
    const { data, error } = await this.client().auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Wishlist access requires an authenticated user.');
    return data.user.id;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseFeedbackRepository extends SupabaseRepositoryBase implements FeedbackRepository {
  async submit(feedback: Inserts<'feedback'>) {
    const { data, error } = await this.client().from('feedback').insert(feedback).select('*').single();
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseStorageRepository extends SupabaseRepositoryBase implements StorageRepository {
  private static readonly PRODUCT_IMAGES_BUCKET = 'product-images';

  getProductImageUrl(path: string) {
    return this.client().storage.from(SupabaseStorageRepository.PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async uploadProductImage(path: string, file: File) {
    const { error } = await this.client().storage.from(SupabaseStorageRepository.PRODUCT_IMAGES_BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseAdminRepository extends SupabaseRepositoryBase implements AdminRepository {
  async listSettings() {
    const { data, error } = await this.client().from('admin_settings').select('*').order('key');
    if (error) throw error;
    return data;
  }

  async updateSetting(key: string, changes: Updates<'admin_settings'>) {
    const { data, error } = await this.client().from('admin_settings').update(changes).eq('key', key).select('*').single();
    if (error) throw error;
    return data;
  }
}
