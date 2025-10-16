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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_activity: {
        Row: {
          action: string
          actor_id: string | null
          application_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          application_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          application_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_activity_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_messages: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          id: string
          internal_notes: string | null
          job_id: string
          notes: string | null
          rating: number | null
          recommend: boolean | null
          stage: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          tags: string[] | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          job_id: string
          notes?: string | null
          rating?: number | null
          recommend?: boolean | null
          stage?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          tags?: string[] | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          job_id?: string
          notes?: string | null
          rating?: number | null
          recommend?: boolean | null
          stage?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          tags?: string[] | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_logs: {
        Row: {
          analytics: boolean
          consent_version: string
          created_at: string
          essential: boolean
          id: string
          ip_address: string | null
          marketing: boolean
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          consent_version: string
          created_at?: string
          essential?: boolean
          id?: string
          ip_address?: string | null
          marketing?: boolean
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          consent_version?: string
          created_at?: string
          essential?: boolean
          id?: string
          ip_address?: string | null
          marketing?: boolean
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cv_builder_data: {
        Row: {
          certifications: Json | null
          created_at: string | null
          education: Json | null
          id: string
          languages: Json | null
          personal_info: Json | null
          skills: Json | null
          template_name: string
          updated_at: string | null
          user_id: string
          work_experience: Json | null
        }
        Insert: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          id?: string
          languages?: Json | null
          personal_info?: Json | null
          skills?: Json | null
          template_name?: string
          updated_at?: string | null
          user_id: string
          work_experience?: Json | null
        }
        Update: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          id?: string
          languages?: Json | null
          personal_info?: Json | null
          skills?: Json | null
          template_name?: string
          updated_at?: string | null
          user_id?: string
          work_experience?: Json | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          id: string
          notes: string | null
          request_type: string
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          request_type: string
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          request_type?: string
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      data_retention_settings: {
        Row: {
          auto_delete_enabled: boolean | null
          created_at: string | null
          id: string
          last_cleanup_at: string | null
          retention_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_delete_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_cleanup_at?: string | null
          retention_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      draft_jobs: {
        Row: {
          application_email: string | null
          application_method: string | null
          application_url: string | null
          auto_reply_template: string | null
          city: string | null
          contact_person: string | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          description: string | null
          facility_id: string | null
          facility_type: Database["public"]["Enums"]["facility_type"] | null
          featured: boolean | null
          id: string
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_unit: Database["public"]["Enums"]["salary_unit"] | null
          scheduled_publish_at: string | null
          shift_type: string | null
          state: string | null
          step: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_email?: string | null
          application_method?: string | null
          application_url?: string | null
          auto_reply_template?: string | null
          city?: string | null
          contact_person?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          featured?: boolean | null
          id?: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          scheduled_publish_at?: string | null
          shift_type?: string | null
          state?: string | null
          step?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_email?: string | null
          application_method?: string | null
          application_url?: string | null
          auto_reply_template?: string | null
          city?: string | null
          contact_person?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          featured?: boolean | null
          id?: string
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          scheduled_publish_at?: string | null
          shift_type?: string | null
          state?: string | null
          step?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employer_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          employer_id: string
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          employer_id: string
          id?: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          employer_id?: string
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          city: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          state: string
          type: Database["public"]["Enums"]["facility_type"]
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          state: string
          type: Database["public"]["Enums"]["facility_type"]
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          state?: string
          type?: Database["public"]["Enums"]["facility_type"]
        }
        Relationships: []
      }
      job_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          job_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          job_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          job_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_public"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          applications_count: number | null
          approved: boolean | null
          bonus: string | null
          city: string
          closed_at: string | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          description: string | null
          facility_id: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          featured: boolean | null
          housing: boolean | null
          id: string
          is_active: boolean | null
          lang_de: string | null
          owner_id: string | null
          posted_at: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_unit: Database["public"]["Enums"]["salary_unit"] | null
          saves_count: number | null
          scheduled_unpublish_at: string | null
          shift_type: string | null
          state: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          approved?: boolean | null
          bonus?: string | null
          city: string
          closed_at?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          featured?: boolean | null
          housing?: boolean | null
          id?: string
          is_active?: boolean | null
          lang_de?: string | null
          owner_id?: string | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          saves_count?: number | null
          scheduled_unpublish_at?: string | null
          shift_type?: string | null
          state: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          approved?: boolean | null
          bonus?: string | null
          city?: string
          closed_at?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          featured?: boolean | null
          housing?: boolean | null
          id?: string
          is_active?: boolean | null
          lang_de?: string | null
          owner_id?: string | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          saves_count?: number | null
          scheduled_unpublish_at?: string | null
          shift_type?: string | null
          state?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_settings: {
        Row: {
          created_at: string | null
          field_type: string | null
          id: string
          is_required: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value_de: string | null
          value_en: string | null
        }
        Insert: {
          created_at?: string | null
          field_type?: string | null
          id?: string
          is_required?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value_de?: string | null
          value_en?: string | null
        }
        Update: {
          created_at?: string | null
          field_type?: string | null
          id?: string
          is_required?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value_de?: string | null
          value_en?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          created_at: string | null
          employer_id: string
          id: string
          name: string
          subject: string | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          employer_id: string
          id?: string
          name: string
          subject?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          employer_id?: string
          id?: string
          name?: string
          subject?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          city: string | null
          created_at: string | null
          cv_url: string | null
          email: string | null
          email_recommendations: boolean | null
          id: string
          languages: Json | null
          name: string | null
          phone: string | null
          qualifications: string[] | null
          recommendation_frequency: string | null
          recommendations_enabled: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          skills: string[] | null
          state: string | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          cv_url?: string | null
          email?: string | null
          email_recommendations?: boolean | null
          id: string
          languages?: Json | null
          name?: string | null
          phone?: string | null
          qualifications?: string[] | null
          recommendation_frequency?: string | null
          recommendations_enabled?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          state?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          cv_url?: string | null
          email?: string | null
          email_recommendations?: boolean | null
          id?: string
          languages?: Json | null
          name?: string | null
          phone?: string | null
          qualifications?: string[] | null
          recommendation_frequency?: string | null
          recommendations_enabled?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          state?: string | null
        }
        Relationships: []
      }
      salary_benchmarks: {
        Row: {
          data_points: number | null
          experience_level: string
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          last_updated: string | null
          role: string
          salary_max: number
          salary_median: number
          salary_min: number
          state: string
        }
        Insert: {
          data_points?: number | null
          experience_level: string
          facility_type: Database["public"]["Enums"]["facility_type"]
          id?: string
          last_updated?: string | null
          role: string
          salary_max: number
          salary_median: number
          salary_min: number
          state: string
        }
        Update: {
          data_points?: number | null
          experience_level?: string
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          last_updated?: string | null
          role?: string
          salary_max?: number
          salary_median?: number
          salary_min?: number
          state?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          email_alert: string | null
          filters: Json
          id: string
          last_checked_at: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_alert?: string | null
          filters?: Json
          id?: string
          last_checked_at?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_alert?: string | null
          filters?: Json
          id?: string
          last_checked_at?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_active_jobs: number
          name: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_active_jobs: number
          name: string
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_active_jobs?: number
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          applied: boolean | null
          id: string
          job_id: string
          match_score: number
          recommended_at: string
          user_id: string
          viewed: boolean | null
        }
        Insert: {
          applied?: boolean | null
          id?: string
          job_id: string
          match_score: number
          recommended_at?: string
          user_id: string
          viewed?: boolean | null
        }
        Update: {
          applied?: boolean | null
          id?: string
          job_id?: string
          match_score?: number
          recommended_at?: string
          user_id?: string
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_public"
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
      jobs_public: {
        Row: {
          applications_count: number | null
          bonus: string | null
          city: string | null
          closed_at: string | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          description: string | null
          facility_id: string | null
          facility_type: Database["public"]["Enums"]["facility_type"] | null
          featured: boolean | null
          housing: boolean | null
          id: string | null
          is_active: boolean | null
          lang_de: string | null
          posted_at: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_unit: Database["public"]["Enums"]["salary_unit"] | null
          saves_count: number | null
          shift_type: string | null
          state: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          bonus?: string | null
          city?: string | null
          closed_at?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          featured?: boolean | null
          housing?: boolean | null
          id?: string | null
          is_active?: boolean | null
          lang_de?: string | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          saves_count?: number | null
          shift_type?: string | null
          state?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          bonus?: string | null
          city?: string | null
          closed_at?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"] | null
          featured?: boolean | null
          housing?: boolean | null
          id?: string | null
          is_active?: boolean | null
          lang_de?: string | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_unit?: Database["public"]["Enums"]["salary_unit"] | null
          saves_count?: number | null
          shift_type?: string | null
          state?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_job_match_score: {
        Args: {
          candidate_profile: Json
          job_requirements: string[]
          job_tags: string[]
        }
        Returns: number
      }
      can_employer_post_job: {
        Args: { employer_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { _profile_id: string; _viewer_id: string }
        Returns: boolean
      }
      get_employer_active_job_count: {
        Args: { employer_id: string }
        Returns: number
      }
      get_personalized_recommendations: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          city: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          facility_type: Database["public"]["Enums"]["facility_type"]
          job_id: string
          match_score: number
          posted_at: string
          salary_max: number
          salary_min: number
          shift_type: string
          state: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_job_views: {
        Args: { job_id: string }
        Returns: undefined
      }
      mark_message_as_read: {
        Args: { message_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "bewerber" | "arbeitgeber" | "admin"
      application_status:
        | "submitted"
        | "viewed"
        | "interview"
        | "offer"
        | "rejected"
      contract_type: "Vollzeit" | "Teilzeit" | "Minijob" | "Befristet"
      facility_type: "Klinik" | "Krankenhaus" | "Altenheim" | "1zu1"
      salary_unit: "€/h" | "€/Monat"
      subscription_tier: "free" | "pro" | "enterprise"
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
      app_role: ["bewerber", "arbeitgeber", "admin"],
      application_status: [
        "submitted",
        "viewed",
        "interview",
        "offer",
        "rejected",
      ],
      contract_type: ["Vollzeit", "Teilzeit", "Minijob", "Befristet"],
      facility_type: ["Klinik", "Krankenhaus", "Altenheim", "1zu1"],
      salary_unit: ["€/h", "€/Monat"],
      subscription_tier: ["free", "pro", "enterprise"],
    },
  },
} as const
