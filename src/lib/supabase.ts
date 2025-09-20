import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          clerk_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: 'admin' | 'host' | 'customer';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          clerk_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'admin' | 'host' | 'customer';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          clerk_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'admin' | 'host' | 'customer';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          category: string;
          price_per_vial: number;
          price_per_box: number;
          vials_per_box: number;
          is_active: boolean;
          image_url: string | null;
          specifications: any | null;
          created_by: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          category: string;
          price_per_vial: number;
          price_per_box: number;
          vials_per_box?: number;
          is_active?: boolean;
          image_url?: string | null;
          specifications?: any | null;
          created_by: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          category?: string;
          price_per_vial?: number;
          price_per_box?: number;
          vials_per_box?: number;
          is_active?: boolean;
          image_url?: string | null;
          specifications?: any | null;
          created_by?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_buy_batches: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          target_vials: number;
          current_vials: number;
          discount_percentage: number;
          shipping_fee: number;
          start_date: string;
          end_date: string;
          created_by: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          target_vials: number;
          current_vials?: number;
          discount_percentage?: number;
          shipping_fee?: number;
          start_date: string;
          end_date: string;
          created_by: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          target_vials?: number;
          current_vials?: number;
          discount_percentage?: number;
          shipping_fee?: number;
          start_date?: string;
          end_date?: string;
          created_by?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_buy_products: {
        Row: {
          id: number;
          batch_id: number;
          product_id: number;
          target_vials: number;
          current_vials: number;
          price_per_vial: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          batch_id: number;
          product_id: number;
          target_vials: number;
          current_vials?: number;
          price_per_vial: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          batch_id?: number;
          product_id?: number;
          target_vials?: number;
          current_vials?: number;
          price_per_vial?: number;
          created_at?: string;
        };
      };
      sub_groups: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          region: string;
          city: string;
          host_id: number;
          join_fee: number;
          whatsapp_number: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          region: string;
          city: string;
          host_id: number;
          join_fee?: number;
          whatsapp_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          region?: string;
          city?: string;
          host_id?: number;
          join_fee?: number;
          whatsapp_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          order_code: string;
          customer_name: string;
          whatsapp_number: string;
          batch_id: number;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_code: string;
          customer_name: string;
          whatsapp_number: string;
          batch_id: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal?: number;
          shipping_cost?: number;
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_code?: string;
          customer_name?: string;
          whatsapp_number?: string;
          batch_id?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal?: number;
          shipping_cost?: number;
          total_amount?: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price_per_vial: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price_per_vial: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          price_per_vial?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      individual_orders: {
        Row: {
          id: number;
          order_code: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string;
          shipping_address: string;
          shipping_city: string;
          shipping_province: string;
          shipping_zip_code: string | null;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'refunded';
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          user_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_code: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone: string;
          shipping_address: string;
          shipping_city: string;
          shipping_province: string;
          shipping_zip_code?: string | null;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded';
          subtotal: number;
          shipping_cost?: number;
          total_amount: number;
          user_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_code?: string;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string;
          shipping_address?: string;
          shipping_city?: string;
          shipping_province?: string;
          shipping_zip_code?: string | null;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded';
          subtotal?: number;
          shipping_cost?: number;
          total_amount?: number;
          user_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      individual_order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price_per_box: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price_per_box: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          price_per_box?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      sub_group_batches: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
          target_vials: number;
          current_vials: number;
          discount_percentage: number;
          shipping_fee: number;
          start_date: string;
          end_date: string;
          host_id: number;
          region_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
          target_vials: number;
          current_vials?: number;
          discount_percentage?: number;
          shipping_fee?: number;
          start_date: string;
          end_date: string;
          host_id: number;
          region_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'payment_collection' | 'ordering' | 'processing' | 'shipped' | 'delivered';
          target_vials?: number;
          current_vials?: number;
          discount_percentage?: number;
          shipping_fee?: number;
          start_date?: string;
          end_date?: string;
          host_id?: number;
          region_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sub_group_orders: {
        Row: {
          id: number;
          order_code: string;
          customer_name: string;
          whatsapp_number: string;
          batch_id: number;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_code: string;
          customer_name: string;
          whatsapp_number: string;
          batch_id: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal?: number;
          shipping_cost?: number;
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_code?: string;
          customer_name?: string;
          whatsapp_number?: string;
          batch_id?: number;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal?: number;
          shipping_cost?: number;
          total_amount?: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
