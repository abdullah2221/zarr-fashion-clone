import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../../core/supabase/supabase-client.service';
import { Inserts, Tables, Updates } from '../models/database.types';
import {
  AdminActivityRepository,
  AdminRepository,
  AuthRepository,
  BannerRepository,
  BrandRepository,
  CampaignRepository,
  CategoryRepository,
  ContactMessageRepository,
  CustomerRepository,
  FaqRepository,
  FeedbackRepository,
  MediaObject,
  MediaRepository,
  OrderRepository,
  OrderStatusHistoryRepository,
  ProfileRepository,
  SitePageRepository,
  ProductRepository,
  StorageRepository,
  SubscriberRepository,
  TestimonialRepository,
  WishlistRepository,
  CheckoutOrderParams,
  CheckoutOrderResult,} from '../repositories/repositories';

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

  async resetPasswordForEmail(email: string, redirectTo?: string) {
    const { error } = await this.client().auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await this.client().auth.updateUser({ password });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await this.client().auth.signOut();
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseProfileRepository extends SupabaseRepositoryBase implements ProfileRepository {
  async getCurrent() {
    const user = await this.currentUser();
    if (!user) return null;

    const { data, error } = await this.client().from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateCurrent(changes: Updates<'profiles'>) {
    const user = await this.currentUser();
    if (!user) throw new Error('Profile update requires an authenticated user.');

    const { data, error } = await this.client().from('profiles').update(changes).eq('id', user.id).select('*').single();
    if (error) throw error;
    return data;
  }

  async upsertProfile(profile: Inserts<'profiles'>) {
    const { data, error } = await this.client()
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async isAdmin() {
    const client = this.client() as unknown as {
      rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data, error } = await client.rpc('is_admin');
    if (error) throw error as Error;
    return Boolean(data);
  }

  async isSuperAdmin() {
    const client = this.client() as unknown as {
      rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data, error } = await client.rpc('is_super_admin');
    if (error) throw error as Error;
    return Boolean(data);
  }

  private async currentUser() {
    const { data, error } = await this.client().auth.getUser();
    if (error) throw error;
    return data.user;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseProductRepository extends SupabaseRepositoryBase implements ProductRepository {
  async listActive() {
    const { data, error } = await this.client().from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client().from('products').select('*').eq('id', id).maybeSingle();
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

  async createImage(image: Inserts<'product_images'>) {
    const { data, error } = await this.client().from('product_images').insert(image).select('*').single();
    if (error) throw error;
    return data;
  }

  async updateImage(id: string, changes: Updates<'product_images'>) {
    const { data, error } = await this.client().from('product_images').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async deleteImage(id: string) {
    const { error } = await this.client().from('product_images').delete().eq('id', id);
    if (error) throw error;
  }

  async create(product: Inserts<'products'>) {
    const { data, error } = await this.client().from('products').insert(product).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'products'>) {
    const { data, error } = await this.client().from('products').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('products').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseCategoryRepository extends SupabaseRepositoryBase implements CategoryRepository {
  async listActive() {
    const { data, error } = await this.client().from('categories').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('categories').select('*').order('sort_order').order('name');
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client().from('categories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.client().from('categories').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(category: Inserts<'categories'>) {
    const { data, error } = await this.client().from('categories').insert(category).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'categories'>) {
    const { data, error } = await this.client().from('categories').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseBannerRepository extends SupabaseRepositoryBase implements BannerRepository {
  async listActive() {
    const { data, error } = await this.client().from('banners').select('*').eq('is_active', true).order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('banners').select('*').order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client().from('banners').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(banner: Inserts<'banners'>) {
    const { data, error } = await this.client().from('banners').insert(banner).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'banners'>) {
    const { data, error } = await this.client().from('banners').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('banners').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseCampaignRepository extends SupabaseRepositoryBase implements CampaignRepository {
  async listActive() {
    const { data, error } = await this.client().from('campaigns').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client().from('campaigns').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(campaign: Inserts<'campaigns'>) {
    const { data, error } = await this.client().from('campaigns').insert(campaign).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'campaigns'>) {
    const { data, error } = await this.client().from('campaigns').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('campaigns').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseOrderRepository extends SupabaseRepositoryBase implements OrderRepository {

  private async callCheckoutRpc(
    fn: 'create_guest_order' | 'create_customer_order',
    params: CheckoutOrderParams,
  ): Promise<CheckoutOrderResult> {
    const client = this.client() as unknown as {
      rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data, error } = await client.rpc(fn, {
      payload: params,
    });
    if (error) throw error as Error;
    const row = Array.isArray(data) ? data[0] : data;
    const typedRow = row as {
      order_id?: string;
      order_number?: string;
      subtotal?: number | string;
      shipping_amount?: number | string;
      total_amount?: number | string;
    } | null;
    if (!typedRow?.order_id) throw new Error('Order creation returned an invalid payload.');
    return {
      order_id: typedRow.order_id,
      order_number: typedRow.order_number || '',
      subtotal: Number(typedRow.subtotal ?? 0),
      shipping_amount: Number(typedRow.shipping_amount ?? 0),
      total_amount: Number(typedRow.total_amount ?? 0),
    };
  }

  async createGuestCheckout(params: CheckoutOrderParams) {
    return this.callCheckoutRpc('create_guest_order', params);
  }

  async createCustomerCheckout(params: CheckoutOrderParams) {
    return this.callCheckoutRpc('create_customer_order', params);
  }

  async listMine() {
    const { data, error } = await this.client().from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findByOrderNumberAndPhone(orderNumber: string, phone: string) {
    const client = this.client() as unknown as {
      rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data, error } = await client.rpc('track_order_public', {
      lookup_order_number: orderNumber.trim(),
      lookup_phone: phone.trim(),
    });
    if (error) throw error as Error;
    const row = Array.isArray(data) ? data[0] : null;
    if (!row || typeof row !== 'object') return null;
    return row as {
      order_number: string;
      status: string;
      payment_method: string | null;
      city: string | null;
      province: string | null;
      total_amount: number;
      tracking_number: string | null;
      courier_name: string | null;
      dispatch_date: string | null;
      delivered_date: string | null;
      created_at: string;
    };
  }

  async listAll() {
    const { data, error } = await this.client().from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await this.client().from('orders').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async listItems(orderId: string) {
    const { data, error } = await this.client().from('order_items').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'orders'>) {
    const { data, error } = await this.client().from('orders').update(changes).eq('id', id).select('*').single();
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

  /** Returns a usable image URL from either a Supabase storage path or a full remote URL.
   *  If `path` starts with http/https it is a remote placeholder/CDN URL and is
   *  returned as-is — no Supabase bucket call is made.
   *  Local storage paths are resolved through the product-images bucket as normal.
   */
  getProductImageUrl(path: string): string {
    if (this.isRemoteUrl(path)) return path;
    return this.client().storage.from(SupabaseStorageRepository.PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  getPublicImageUrl(path: string): string {
    return this.getProductImageUrl(path);
  }

  async uploadProductImage(path: string, file: File, options?: { upsert?: boolean }) {
    const { error } = await this.client().storage.from(SupabaseStorageRepository.PRODUCT_IMAGES_BUCKET).upload(path, file, {
      upsert: options?.upsert ?? false,
    });
    if (error) throw error;
    return path;
  }

  async uploadPublicImage(path: string, file: File, options?: { upsert?: boolean }) {
    return this.uploadProductImage(path, file, options);
  }

  /** Removes a product image from Supabase Storage.
   *  If the path is a remote URL (placeholder/CDN), this is a no-op —
   *  remote URLs are never stored in our bucket.
   */
  async removeProductImage(path: string) {
    if (this.isRemoteUrl(path)) return;
    const { error } = await this.client().storage.from(SupabaseStorageRepository.PRODUCT_IMAGES_BUCKET).remove([path]);
    if (error) throw error;
  }

  async removePublicImage(path: string) {
    await this.removeProductImage(path);
  }

  /**
   * Phase 8 — shared-library guard. The media picker lets several
   * records point at one storage file, so a delete must never remove
   * a file another record still references. Checks product images,
   * banners, categories, campaign metadata and page-section payloads
   * (the last two are small tables, scanned in code). Fail-safe: any
   * query error counts as "referenced" — the file is kept (orphan)
   * rather than risk breaking a live record.
   */
  async isStoragePathReferenced(path: string): Promise<boolean> {
    if (this.isRemoteUrl(path)) return false;
    const client = this.client();
    try {
      const [products, banners, categories] = await Promise.all([
        client.from('product_images').select('id').eq('storage_path', path).limit(1),
        client.from('banners').select('id').eq('image_path', path).limit(1),
        client.from('categories').select('id').eq('image_path', path).limit(1),
      ]);
      if (products.error || banners.error || categories.error) return true;
      if (products.data?.length || banners.data?.length || categories.data?.length) return true;

      const { data: campaigns, error: campaignsError } = await client
        .from('campaigns')
        .select('metadata');
      if (campaignsError) return true;
      if ((campaigns ?? []).some(row => {
        const metadata = (row as { metadata: unknown }).metadata;
        return metadata !== null && typeof metadata === 'object'
          && (metadata as Record<string, unknown>)['imagePath'] === path;
      })) return true;

      const { data: sections, error: sectionsError } = await client
        .from('page_sections')
        .select('content');
      if (sectionsError) return true;
      return (sections ?? []).some(row =>
        JSON.stringify((row as { content: unknown }).content).includes(path));
    } catch {
      return true;
    }
  }

  /**
   * Removes the storage object only when nothing references it.
   * Callers must delete their own database row FIRST, so their own
   * reference no longer counts. Remote URLs are never bucket files.
   */
  async removeImageIfUnreferenced(path: string): Promise<void> {
    if (this.isRemoteUrl(path)) return;
    if (await this.isStoragePathReferenced(path)) return;
    await this.removeProductImage(path);
  }

  /** Returns true if the path is an absolute http/https URL (remote placeholder or CDN). */
  private isRemoteUrl(path: string): boolean {
    return path.startsWith('http://') || path.startsWith('https://');
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

  async getSetting(key: string) {
    const { data, error } = await this.client().from('admin_settings').select('*').eq('key', key).maybeSingle();
    if (error) throw error;
    return data;
  }

  async upsertSetting(setting: Inserts<'admin_settings'>) {
    const { data, error } = await this.client().from('admin_settings').upsert(setting).select('*').single();
    if (error) throw error;
    return data;
  }

  async deleteSetting(key: string) {
    const { error } = await this.client().from('admin_settings').delete().eq('key', key);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseSitePageRepository extends SupabaseRepositoryBase implements SitePageRepository {
  async listActivePages() {
    const { data, error } = await this.client().from('site_pages').select('*').eq('is_active', true).order('slug', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listAllPages() {
    const { data, error } = await this.client().from('site_pages').select('*').order('slug', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getPageBySlug(slug: string) {
    const { data, error } = await this.client().from('site_pages').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createPage(page: Inserts<'site_pages'>) {
    const { data, error } = await this.client().from('site_pages').insert(page).select('*').single();
    if (error) throw error;
    return data;
  }

  async updatePage(id: string, changes: Updates<'site_pages'>) {
    const { data, error } = await this.client().from('site_pages').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async deletePage(id: string) {
    const { error } = await this.client().from('site_pages').delete().eq('id', id);
    if (error) throw error;
  }

  async listActiveSections(pageId: string) {
    const { data, error } = await this.client().from('page_sections').select('*').eq('page_id', pageId).eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listAllSections(pageId: string) {
    const { data, error } = await this.client().from('page_sections').select('*').eq('page_id', pageId).order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createSection(section: Inserts<'page_sections'>) {
    const { data, error } = await this.client().from('page_sections').insert(section).select('*').single();
    if (error) throw error;
    return data;
  }

  async updateSection(id: string, changes: Updates<'page_sections'>) {
    const { data, error } = await this.client().from('page_sections').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async deleteSection(id: string) {
    const { error } = await this.client().from('page_sections').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseFaqRepository extends SupabaseRepositoryBase implements FaqRepository {
  async listActive() {
    const { data, error } = await this.client().from('faqs').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('faqs').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(faq: Inserts<'faqs'>) {
    const { data, error } = await this.client().from('faqs').insert(faq).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'faqs'>) {
    const { data, error } = await this.client().from('faqs').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('faqs').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseTestimonialRepository extends SupabaseRepositoryBase implements TestimonialRepository {
  async listActive() {
    const { data, error } = await this.client().from('testimonials').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('testimonials').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(testimonial: Inserts<'testimonials'>) {
    const { data, error } = await this.client().from('testimonials').insert(testimonial).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'testimonials'>) {
    const { data, error } = await this.client().from('testimonials').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('testimonials').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseBrandsRepository extends SupabaseRepositoryBase implements BrandRepository {
  async listActive() {
    const { data, error } = await this.client().from('brands').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async listAll() {
    const { data, error } = await this.client().from('brands').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(brand: Inserts<'brands'>) {
    const { data, error } = await this.client().from('brands').insert(brand).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(id: string, changes: Updates<'brands'>) {
    const { data, error } = await this.client().from('brands').update(changes).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.client().from('brands').delete().eq('id', id);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseAdminActivityRepository extends SupabaseRepositoryBase implements AdminActivityRepository {
  async listRecent(limit: number) {
    const { data, error } = await this.client().from('admin_activity').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  }

  async log(entry: Inserts<'admin_activity'>) {
    const { error } = await this.client().from('admin_activity').insert(entry);
    if (error) throw error;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseSubscriberRepository extends SupabaseRepositoryBase implements SubscriberRepository {
  async subscribe(email: string): Promise<'subscribed' | 'duplicate'> {
    // No .select() on purpose: the subscribers table is INSERT-only
    // for the public role, so asking PostgREST to return the row
    // would fail. A unique-violation (23505) means "already on the
    // list", which the forms surface as a friendly duplicate state.
    const { error } = await this.client().from('subscribers').insert({ email });
    if (error) {
      if ((error as { code?: string }).code === '23505') return 'duplicate';
      throw error;
    }
    return 'subscribed';
  }

  async listAll() {
    const { data, error } = await this.client().from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseContactMessageRepository extends SupabaseRepositoryBase implements ContactMessageRepository {
  async send(message: Inserts<'contact_messages'>) {
    // INSERT-only for the public role — no .select(), see subscribers.
    const { error } = await this.client().from('contact_messages').insert(message);
    if (error) throw error;
  }

  async listAll() {
    const { data, error } = await this.client().from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async setHandled(id: string, handled: boolean) {
    const { data, error } = await this.client().from('contact_messages').update({ is_handled: handled }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseCustomerRepository extends SupabaseRepositoryBase implements CustomerRepository {
  async listProfiles() {
    const { data, error } = await this.client().from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async setRole(userId: string, role: Tables<'profiles'>['role']) {
    const { data, error } = await this.client().rpc('set_user_role', { target_user_id: userId, target_role: role });
    if (error) throw error;
    return data as Tables<'profiles'>;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseOrderStatusHistoryRepository extends SupabaseRepositoryBase implements OrderStatusHistoryRepository {
  async listByOrder(orderId: string) {
    const { data, error } = await this.client().from('order_status_history').select('*').eq('order_id', orderId).order('changed_at', { ascending: true });
    if (error) throw error;
    return data;
  }
}

@Injectable({ providedIn: 'root' })
export class SupabaseMediaRepository extends SupabaseRepositoryBase implements MediaRepository {
  private static readonly PRODUCT_IMAGES_BUCKET = 'product-images';

  async listFolder(folder: string): Promise<MediaObject[]> {
    const { data, error } = await this.client().storage
      .from(SupabaseMediaRepository.PRODUCT_IMAGES_BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw error;
    return (data || []).map(item => ({
      name: item.name,
      id: item.id,
      updated_at: item.updated_at,
      created_at: item.created_at,
      last_accessed_at: item.last_accessed_at,
      metadata: (item.metadata || null) as Record<string, unknown> | null,
    }));
  }

  getPublicUrl(path: string): string {
    return this.client().storage.from(SupabaseMediaRepository.PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  }
}
