export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advertisements: {
        Row: {
          clicks: number | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string
          impressions: number | null
          is_active: boolean | null
          start_date: string
          target_url: string
          title: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          impressions?: number | null
          is_active?: boolean | null
          start_date: string
          target_url: string
          title: string
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          impressions?: number | null
          is_active?: boolean | null
          start_date?: string
          target_url?: string
          title?: string
        }
        Relationships: []
      }
      domain_likes: {
        Row: {
          created_at: string | null
          domain_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          domain_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          domain_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_likes_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          buyer_id: string | null
          category: string
          created_at: string | null
          description: string
          expiration_date: string
          id: string
          is_admin_pick: boolean | null
          is_sponsored: boolean | null
          is_verified: boolean | null
          likes: number | null
          name: string
          price: number
          purchase_date: string | null
          seller_id: string | null
          seller_name: string
          tld: string
          verification_code: string | null
          verification_date: string | null
          verification_method: string | null
          verification_notes: string | null
          verification_status: string
        }
        Insert: {
          buyer_id?: string | null
          category: string
          created_at?: string | null
          description: string
          expiration_date: string
          id?: string
          is_admin_pick?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          likes?: number | null
          name: string
          price?: number
          purchase_date?: string | null
          seller_id?: string | null
          seller_name: string
          tld: string
          verification_code?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string
        }
        Update: {
          buyer_id?: string | null
          category?: string
          created_at?: string | null
          description?: string
          expiration_date?: string
          id?: string
          is_admin_pick?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          likes?: number | null
          name?: string
          price?: number
          purchase_date?: string | null
          seller_id?: string | null
          seller_name?: string
          tld?: string
          verification_code?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_active: boolean
          order_number: number
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          order_number?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          order_number?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          source: string | null
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          source?: string | null
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          source?: string | null
          subscribed?: boolean | null
        }
        Relationships: []
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
      users: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          name: string | null
          phone: string | null
          profile_image_url: string | null
          verified_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          verified_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
