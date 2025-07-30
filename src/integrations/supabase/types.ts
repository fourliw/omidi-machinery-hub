export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          component_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          model_number: string | null
          name: string
          specifications: Json | null
          updated_at: string | null
        }
        Insert: {
          component_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          specifications?: Json | null
          updated_at?: string | null
        }
        Update: {
          component_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          model_number?: string | null
          name?: string
          specifications?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_inquiries: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          company_name: string | null
          company_size: string | null
          contact_name: string
          country: string | null
          created_at: string | null
          email: string
          follow_up_date: string | null
          id: string
          inquiry_type: string | null
          message: string
          notes: string | null
          phone: string | null
          priority: string | null
          product_id: string | null
          status: string | null
          subject: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name: string
          country?: string | null
          created_at?: string | null
          email: string
          follow_up_date?: string | null
          id?: string
          inquiry_type?: string | null
          message: string
          notes?: string | null
          phone?: string | null
          priority?: string | null
          product_id?: string | null
          status?: string | null
          subject?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name?: string
          country?: string | null
          created_at?: string | null
          email?: string
          follow_up_date?: string | null
          id?: string
          inquiry_type?: string | null
          message?: string
          notes?: string | null
          phone?: string | null
          priority?: string | null
          product_id?: string | null
          status?: string | null
          subject?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_component_count"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          news_type: string | null
          published_at: string | null
          search_vector: unknown | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          news_type?: string | null
          published_at?: string | null
          search_vector?: unknown | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          news_type?: string | null
          published_at?: string | null
          search_vector?: unknown | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_components: {
        Row: {
          component_id: string
          created_at: string | null
          id: string
          is_optional: boolean | null
          notes: string | null
          product_id: string
          quantity: number | null
          sort_order: number | null
        }
        Insert: {
          component_id: string
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          product_id: string
          quantity?: number | null
          sort_order?: number | null
        }
        Update: {
          component_id?: string
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          notes?: string | null
          product_id?: string
          quantity?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_component_count"
            referencedColumns: ["id"]
          },
        ]
      }
      product_faqs: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_active: boolean | null
          product_id: string | null
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          question?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_component_count"
            referencedColumns: ["id"]
          },
        ]
      }
      product_filters: {
        Row: {
          category_id: string | null
          created_at: string | null
          display_order: number | null
          filter_name: string
          filter_options: Json | null
          filter_type: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_name: string
          filter_options?: Json | null
          filter_type: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_name?: string
          filter_options?: Json | null
          filter_type?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_filters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          is_primary: boolean | null
          media_type: string
          mime_type: string | null
          product_id: string
          sort_order: number | null
          title: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_primary?: boolean | null
          media_type: string
          mime_type?: string | null
          product_id: string
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_primary?: boolean | null
          media_type?: string
          mime_type?: string | null
          product_id?: string
          sort_order?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_component_count"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          automation_level: string | null
          category_id: string | null
          certification_standards: string[] | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          is_bestseller: boolean | null
          is_featured: boolean | null
          lead_time_days: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          power_consumption: Json | null
          price: number | null
          price_currency: string | null
          price_type: string | null
          product_type: string
          production_capacity: Json | null
          search_vector: unknown | null
          short_description: string | null
          slug: string
          specifications: Json | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          warranty_months: number | null
          weight: number | null
        }
        Insert: {
          automation_level?: string | null
          category_id?: string | null
          certification_standards?: string[] | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          power_consumption?: Json | null
          price?: number | null
          price_currency?: string | null
          price_type?: string | null
          product_type: string
          production_capacity?: Json | null
          search_vector?: unknown | null
          short_description?: string | null
          slug: string
          specifications?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          warranty_months?: number | null
          weight?: number | null
        }
        Update: {
          automation_level?: string | null
          category_id?: string | null
          certification_standards?: string[] | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          lead_time_days?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          power_consumption?: Json | null
          price?: number | null
          price_currency?: string | null
          price_type?: string | null
          product_type?: string
          production_capacity?: Json | null
          search_vector?: unknown | null
          short_description?: string | null
          slug?: string
          specifications?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          warranty_months?: number | null
          weight?: number | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      products_with_categories: {
        Row: {
          automation_level: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          certification_standards: string[] | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          lead_time_days: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          power_consumption: Json | null
          price: number | null
          price_currency: string | null
          price_type: string | null
          product_type: string | null
          production_capacity: Json | null
          search_vector: unknown | null
          short_description: string | null
          slug: string | null
          specifications: Json | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          warranty_months: number | null
          weight: number | null
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
      products_with_component_count: {
        Row: {
          automation_level: string | null
          category_id: string | null
          certification_standards: string[] | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          lead_time_days: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          power_consumption: Json | null
          price: number | null
          price_currency: string | null
          price_type: string | null
          product_type: string | null
          production_capacity: Json | null
          search_vector: unknown | null
          short_description: string | null
          slug: string | null
          specifications: Json | null
          status: string | null
          tags: string[] | null
          total_components: number | null
          updated_at: string | null
          warranty_months: number | null
          weight: number | null
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
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
