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
      batches: {
        Row: {
          created_at: string | null
          created_by: string
          expiry_date: string
          id: string
          manufacturing_date: string
          medication_name: string
          qr_code: string
          quantity: number
          remaining_quantity: number
          status: Database["public"]["Enums"]["batch_status"]
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expiry_date: string
          id?: string
          manufacturing_date: string
          medication_name: string
          qr_code: string
          quantity: number
          remaining_quantity?: number
          status?: Database["public"]["Enums"]["batch_status"]
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expiry_date?: string
          id?: string
          manufacturing_date?: string
          medication_name?: string
          qr_code?: string
          quantity?: number
          remaining_quantity?: number
          status?: Database["public"]["Enums"]["batch_status"]
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatches: {
        Row: {
          batch_id: string
          created_at: string | null
          dispatched_at: string | null
          dispatched_by: string
          from_warehouse_id: string
          id: string
          quantity: number
          received_at: string | null
          received_by: string | null
          status: Database["public"]["Enums"]["dispatch_status"]
          to_hospital_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          dispatched_at?: string | null
          dispatched_by: string
          from_warehouse_id: string
          id?: string
          quantity: number
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["dispatch_status"]
          to_hospital_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          dispatched_at?: string | null
          dispatched_by?: string
          from_warehouse_id?: string
          id?: string
          quantity?: number
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["dispatch_status"]
          to_hospital_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_dispatched_by_fkey"
            columns: ["dispatched_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_to_hospital_id_fkey"
            columns: ["to_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          location: string
          name: string
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          id?: string
          location: string
          name: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number
          created_at: string | null
          hospital_id: string
          id: string
          medical_record: string
          name: string
        }
        Insert: {
          age: number
          created_at?: string | null
          hospital_id: string
          id?: string
          medical_record: string
          name: string
        }
        Update: {
          age?: number
          created_at?: string | null
          hospital_id?: string
          id?: string
          medical_record?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          administered_at: string | null
          batch_id: string
          clinician_id: string
          created_at: string | null
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          quantity: number
        }
        Insert: {
          administered_at?: string | null
          batch_id: string
          clinician_id: string
          created_at?: string | null
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id: string
          quantity: number
        }
        Update: {
          administered_at?: string | null
          batch_id?: string
          clinician_id?: string
          created_at?: string | null
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          hospital_id: string | null
          id: string
          is_approved: boolean
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          hospital_id?: string | null
          id: string
          is_approved?: boolean
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          hospital_id?: string | null
          id?: string
          is_approved?: boolean
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          created_at: string | null
          id: string
          location: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: { user_email: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_status: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pending_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      batch_status: "created" | "dispatched" | "received" | "administered"
      dispatch_status: "pending" | "in_transit" | "received"
      user_role:
        | "admin"
        | "warehouse"
        | "hospital"
        | "clinician"
        | "unassigned"
        | "super_admin"
      user_status: "pending" | "approved" | "rejected"
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
      batch_status: ["created", "dispatched", "received", "administered"],
      dispatch_status: ["pending", "in_transit", "received"],
      user_role: [
        "admin",
        "warehouse",
        "hospital",
        "clinician",
        "unassigned",
        "super_admin",
      ],
      user_status: ["pending", "approved", "rejected"],
    },
  },
} as const
