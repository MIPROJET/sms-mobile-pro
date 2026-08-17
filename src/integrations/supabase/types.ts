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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          page_url: string | null
          properties: Json
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          page_url?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          page_url?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_executions: {
        Row: {
          campaign_id: string
          created_at: string
          delivered_count: number
          error: string | null
          failed_count: number
          id: string
          run_at: string
          sent_count: number
          status: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          delivered_count?: number
          error?: string | null
          failed_count?: number
          id?: string
          run_at?: string
          sent_count?: number
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          delivered_count?: number
          error?: string | null
          failed_count?: number
          id?: string
          run_at?: string
          sent_count?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_executions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          delivered_count: number
          failed_count: number
          id: string
          last_run_at: string | null
          message: string
          name: string
          next_run_at: string | null
          recipients: Json
          recurrence: string | null
          recurrence_end: string | null
          scheduled_at: string | null
          sender_id: string
          sent_count: number
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          last_run_at?: string | null
          message: string
          name: string
          next_run_at?: string | null
          recipients?: Json
          recurrence?: string | null
          recurrence_end?: string | null
          scheduled_at?: string | null
          sender_id: string
          sent_count?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          last_run_at?: string | null
          message?: string
          name?: string
          next_run_at?: string | null
          recipients?: Json
          recurrence?: string | null
          recurrence_end?: string | null
          scheduled_at?: string | null
          sender_id?: string
          sent_count?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          phone: string | null
          source: string | null
          status: string
          subject: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          phone?: string | null
          source?: string | null
          status?: string
          subject: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          phone?: string | null
          source?: string | null
          status?: string
          subject?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta: string | null
          duration_ms: number
          eyebrow: string
          href: string | null
          id: string
          is_active: boolean
          kind: string
          media_url: string
          pause_on_hover: boolean
          position: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta?: string | null
          duration_ms?: number
          eyebrow?: string
          href?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          media_url: string
          pause_on_hover?: boolean
          position?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta?: string | null
          duration_ms?: number
          eyebrow?: string
          href?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          media_url?: string
          pause_on_hover?: boolean
          position?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_fcfa: number
          created_at: string
          id: string
          package_id: string
          provider: string | null
          provider_payload: Json | null
          provider_transaction_id: string | null
          sms_volume: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          id?: string
          package_id: string
          provider?: string | null
          provider_payload?: Json | null
          provider_transaction_id?: string | null
          sms_volume: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          id?: string
          package_id?: string
          provider?: string | null
          provider_payload?: Json | null
          provider_transaction_id?: string | null
          sms_volume?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean
          created_at: string
          featured: boolean
          features: Json
          id: string
          name: string
          price_fcfa: number
          slug: string
          sms_volume: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          featured?: boolean
          features?: Json
          id?: string
          name: string
          price_fcfa: number
          slug: string
          sms_volume: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          featured?: boolean
          features?: Json
          id?: string
          name?: string
          price_fcfa?: number
          slug?: string
          sms_volume?: number
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          gdpr_consent_at: string | null
          id: string
          marketing_consent: boolean
          phone: string | null
          sms_credits: number
          updated_at: string
          username: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gdpr_consent_at?: string | null
          id: string
          marketing_consent?: boolean
          phone?: string | null
          sms_credits?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gdpr_consent_at?: string | null
          id?: string
          marketing_consent?: boolean
          phone?: string | null
          sms_credits?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sms_messages: {
        Row: {
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          error: string | null
          id: string
          message: string
          phone: string
          provider_message_id: string | null
          sender_id: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          message: string
          phone: string
          provider_message_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          message?: string
          phone?: string
          provider_message_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
