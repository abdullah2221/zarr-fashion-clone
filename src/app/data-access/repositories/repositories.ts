import { Session, User } from '@supabase/supabase-js';
import { Inserts, Tables, Updates } from '../models/database.types';

export interface AuthRepository {
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<User | null>;
  signInWithPassword(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  resetPasswordForEmail(email: string, redirectTo?: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface ProfileRepository {
  getCurrent(): Promise<Tables<'profiles'> | null>;
  updateCurrent(changes: Updates<'profiles'>): Promise<Tables<'profiles'>>;
  upsertProfile(profile: Inserts<'profiles'>): Promise<Tables<'profiles'>>;
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

export interface SitePageRepository {
  listActivePages(): Promise<Tables<'site_pages'>[]>;
  listAllPages(): Promise<Tables<'site_pages'>[]>;
  getPageBySlug(slug: string): Promise<Tables<'site_pages'> | null>;
  createPage(page: Inserts<'site_pages'>): Promise<Tables<'site_pages'>>;
  updatePage(id: string, changes: Updates<'site_pages'>): Promise<Tables<'site_pages'>>;
  deletePage(id: string): Promise<void>;
  listActiveSections(pageId: string): Promise<Tables<'page_sections'>[]>;
  listAllSections(pageId: string): Promise<Tables<'page_sections'>[]>;
  createSection(section: Inserts<'page_sections'>): Promise<Tables<'page_sections'>>;
  updateSection(id: string, changes: Updates<'page_sections'>): Promise<Tables<'page_sections'>>;
  deleteSection(id: string): Promise<void>;
}

export interface CheckoutOrderParams {
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  city: string;
  province: string;
  notes: string | null;
  // Only product ids and quantities are sent. Prices, totals, status and
  // the order number are computed by the database (phase 6) and any money
  // fields a caller adds here are ignored by the server.
  items: Array<{
    product_id: string;
    quantity: number;
    size?: string | null;
    color?: string | null;
  }>;
}

export interface CheckoutOrderResult {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
}

export interface OrderRepository {
  createGuestCheckout(params: CheckoutOrderParams): Promise<CheckoutOrderResult>;
  createCustomerCheckout(params: CheckoutOrderParams): Promise<CheckoutOrderResult>;
  listMine(): Promise<Tables<'orders'>[]>;
  findByOrderNumberAndPhone(orderNumber: string, phone: string): Promise<{
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
  } | null>;
  listAll(): Promise<Tables<'orders'>[]>;
  getById(id: string): Promise<Tables<'orders'> | null>;
  listItems(orderId: string): Promise<Tables<'order_items'>[]>;
  update(id: string, changes: Updates<'orders'>): Promise<Tables<'orders'>>;
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

export interface FaqRepository {
  listActive(): Promise<Tables<'faqs'>[]>;
  listAll(): Promise<Tables<'faqs'>[]>;
  create(faq: Inserts<'faqs'>): Promise<Tables<'faqs'>>;
  update(id: string, changes: Updates<'faqs'>): Promise<Tables<'faqs'>>;
  delete(id: string): Promise<void>;
}

export interface TestimonialRepository {
  listActive(): Promise<Tables<'testimonials'>[]>;
  listAll(): Promise<Tables<'testimonials'>[]>;
  create(testimonial: Inserts<'testimonials'>): Promise<Tables<'testimonials'>>;
  update(id: string, changes: Updates<'testimonials'>): Promise<Tables<'testimonials'>>;
  delete(id: string): Promise<void>;
}

export interface SubscriberRepository {
  /** Public write path: returns 'subscribed' or 'duplicate'. */
  subscribe(email: string): Promise<'subscribed' | 'duplicate'>;
  listAll(): Promise<Tables<'subscribers'>[]>;
}

export interface ContactMessageRepository {
  /** Public write path (INSERT-only policy). */
  send(message: Inserts<'contact_messages'>): Promise<void>;
  listAll(): Promise<Tables<'contact_messages'>[]>;
  setHandled(id: string, handled: boolean): Promise<Tables<'contact_messages'>>;
}

export interface CustomerRepository {
  listProfiles(): Promise<Tables<'profiles'>[]>;
  /** Role changes go through the set_user_role RPC, which enforces super_admin server-side. */
  setRole(userId: string, role: Tables<'profiles'>['role']): Promise<Tables<'profiles'>>;
}

export interface OrderStatusHistoryRepository {
  listByOrder(orderId: string): Promise<Tables<'order_status_history'>[]>;
}

export interface MediaObject {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface MediaRepository {
  /** Lists one folder level of the product-images bucket (folders have a null id). */
  listFolder(folder: string): Promise<MediaObject[]>;
  getPublicUrl(path: string): string;
}
