export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'customer' | 'admin' | 'super_admin';
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type FeedbackStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; full_name: string | null; phone: string | null; role: UserRole; created_at: string; updated_at: string };
        Insert: { id: string; email?: string | null; full_name?: string | null; phone?: string | null; role?: UserRole; created_at?: string; updated_at?: string };
        Update: { email?: string | null; full_name?: string | null; phone?: string | null; role?: UserRole; updated_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; image_path: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; description?: string | null; image_path?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      products: {
        Row: { id: string; legacy_id: number; sku: string; name: string; slug: string; brand: string | null; description: string | null; price: number; original_price: number | null; category_id: string | null; is_active: boolean; is_featured: boolean; stock_quantity: number; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; legacy_id: number; sku: string; name: string; slug: string; brand?: string | null; description?: string | null; price: number; original_price?: number | null; category_id?: string | null; is_active?: boolean; is_featured?: boolean; stock_quantity?: number; metadata?: Json; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      product_images: {
        Row: { id: string; product_id: string; storage_path: string; alt_text: string | null; is_primary: boolean; sort_order: number; created_at: string };
        Insert: { id?: string; product_id: string; storage_path: string; alt_text?: string | null; is_primary?: boolean; sort_order?: number; created_at?: string };
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>;
        Relationships: [];
      };
      orders: {
        Row: { id: string; user_id: string | null; status: OrderStatus; subtotal: number; shipping_amount: number; total_amount: number; currency: string; shipping_address: Json; notes: string | null; order_number: string | null; customer_name: string | null; customer_phone: string | null; customer_email: string | null; city: string | null; province: string | null; payment_method: string | null; verification_status: string | null; tracking_number: string | null; courier_name: string | null; dispatch_date: string | null; delivered_date: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id?: string | null; status?: OrderStatus; subtotal: number; shipping_amount?: number; total_amount: number; currency?: string; shipping_address: Json; notes?: string | null; order_number?: string | null; customer_name?: string | null; customer_phone?: string | null; customer_email?: string | null; city?: string | null; province?: string | null; payment_method?: string | null; verification_status?: string | null; tracking_number?: string | null; courier_name?: string | null; dispatch_date?: string | null; delivered_date?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; product_name: string; sku: string | null; unit_price: number; quantity: number; line_total: number; size: string | null; color: string | null; created_at: string };
        Insert: { id?: string; order_id: string; product_id?: string | null; product_name: string; sku?: string | null; unit_price: number; quantity: number; line_total: number; size?: string | null; color?: string | null; created_at?: string };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
        Relationships: [];
      };
      wishlist_items: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: { id?: string; user_id: string; product_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['wishlist_items']['Insert']>;
        Relationships: [];
      };
      feedback: {
        Row: { id: string; user_id: string | null; order_id: string | null; product_id: string | null; rating: number | null; message: string; customer_name: string | null; customer_email: string | null; status: FeedbackStatus; approved_by: string | null; approved_at: string | null; created_at: string };
        Insert: { id?: string; user_id?: string | null; order_id?: string | null; product_id?: string | null; rating?: number | null; message: string; customer_name?: string | null; customer_email?: string | null; status?: FeedbackStatus; approved_by?: string | null; approved_at?: string | null; created_at?: string };
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
        Relationships: [];
      };
      banners: {
        Row: { id: string; title: string; subtitle: string | null; image_path: string | null; target_url: string | null; starts_at: string | null; ends_at: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; subtitle?: string | null; image_path?: string | null; target_url?: string | null; starts_at?: string | null; ends_at?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['banners']['Insert']>;
        Relationships: [];
      };
      campaigns: {
        Row: { id: string; name: string; slug: string; description: string | null; starts_at: string | null; ends_at: string | null; is_active: boolean; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; description?: string | null; starts_at?: string | null; ends_at?: string | null; is_active?: boolean; metadata?: Json; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
        Relationships: [];
      };
      admin_settings: {
        Row: { key: string; value: Json; updated_by: string | null; updated_at: string };
        Insert: { key: string; value: Json; updated_by?: string | null; updated_at?: string };
        Update: { value?: Json; updated_by?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_guest_order: {
        Args: { payload: Json };
        Returns: { order_id: string; order_number: string }[];
      };
      track_order_public: {
        Args: { lookup_order_number: string; lookup_phone: string };
        Returns: { order_number: string; status: string; payment_method: string | null; city: string | null; province: string | null; total_amount: number; tracking_number: string | null; courier_name: string | null; dispatch_date: string | null; delivered_date: string | null; created_at: string }[];
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      feedback_status: FeedbackStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
