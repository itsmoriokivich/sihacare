import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: 'admin' | 'warehouse' | 'hospital' | 'clinician';
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: 'admin' | 'warehouse' | 'hospital' | 'clinician';
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          role?: 'admin' | 'warehouse' | 'hospital' | 'clinician';
          is_approved?: boolean;
          updated_at?: string;
        };
      };
      hospitals: {
        Row: {
          id: string;
          name: string;
          location: string;
          capacity: number;
          created_at: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          location: string;
          created_at: string;
        };
      };
      batches: {
        Row: {
          id: string;
          medication_name: string;
          quantity: number;
          manufacturing_date: string;
          expiry_date: string;
          warehouse_id: string;
          status: 'created' | 'dispatched' | 'received' | 'administered';
          qr_code: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          medication_name: string;
          quantity: number;
          manufacturing_date: string;
          expiry_date: string;
          warehouse_id: string;
          qr_code: string;
          created_by: string;
          status?: 'created' | 'dispatched' | 'received' | 'administered';
        };
      };
      dispatches: {
        Row: {
          id: string;
          batch_id: string;
          from_warehouse_id: string;
          to_hospital_id: string;
          quantity: number;
          status: 'pending' | 'in_transit' | 'received';
          dispatched_by: string;
          received_by?: string;
          dispatched_at: string;
          received_at?: string;
          created_at: string;
        };
        Insert: {
          batch_id: string;
          from_warehouse_id: string;
          to_hospital_id: string;
          quantity: number;
          dispatched_by: string;
          status?: 'pending' | 'in_transit' | 'received';
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          age: number;
          hospital_id: string;
          medical_record: string;
          created_at: string;
        };
      };
      usage_records: {
        Row: {
          id: string;
          batch_id: string;
          patient_id: string;
          clinician_id: string;
          hospital_id: string;
          quantity: number;
          notes?: string;
          administered_at: string;
          created_at: string;
        };
        Insert: {
          batch_id: string;
          patient_id: string;
          clinician_id: string;
          hospital_id: string;
          quantity: number;
          notes?: string;
        };
      };
    };
  };
}