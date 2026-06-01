export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          image_path: string | null
          is_active: boolean
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          slug: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          slug: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          slug?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          message: string
          order_id: string | null
          product_id: string | null
          rating: number | null
          status: Database["public"]["Enums"]["feedback_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          message: string
          order_id?: string | null
          product_id?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          message?: string
          order_id?: string | null
          product_id?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
          sku: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          size?: string | null
          sku?: string | null
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          sku?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          courier_name: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivered_date: string | null
          dispatch_date: string | null
          id: string
          notes: string | null
          order_number: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          province: string | null
          shipping_address: Json
          shipping_amount: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          tracking_number: string
          updated_at: string
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          city: string
          courier_name?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivered_date?: string | null
          dispatch_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          province?: string | null
          shipping_address: Json
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          tracking_number: string
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          city?: string
          courier_name?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_date?: string | null
          dispatch_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          province?: string | null
          shipping_address?: Json
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          tracking_number?: string
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          legacy_id: number
          metadata: Json
          name: string
          original_price: number | null
          price: number
          sku: string
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          legacy_id: number
          metadata?: Json
          name: string
          original_price?: number | null
          price: number
          sku: string
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          legacy_id?: number
          metadata?: Json
          name?: string
          original_price?: number | null
          price?: number
          sku?: string
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      feedback_status: "pending" | "approved" | "rejected"
      order_status:
        | "pending"
        | "confirmed"
        | "packed"
        | "processing"
        | "shipped"
        | "delivered"
        | "returned"
        | "cancelled"
      payment_status: "pending" | "paid" | "cancelled"
      user_role: "customer" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      feedback_status: ["pending", "approved", "rejected"],
      order_status: [
        "pending",
        "confirmed",
        "packed",
        "processing",
        "shipped",
        "delivered",
        "returned",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "cancelled"],
      user_role: ["customer", "admin", "super_admin"],
    },
  },
} as const
