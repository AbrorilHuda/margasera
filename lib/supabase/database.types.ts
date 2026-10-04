export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: 'admin' | 'staff';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: 'admin' | 'staff';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: 'admin' | 'staff';
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      packages: {
        Row: {
          id: string;
          service_id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          down_payment: number | null;
          duration: string | null;
          photographer_count: number | null;
          edited_photos: string | null;
          features: string[];
          is_popular: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          down_payment?: number | null;
          duration?: string | null;
          photographer_count?: number | null;
          edited_photos?: string | null;
          features?: string[];
          is_popular?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          service_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          down_payment?: number | null;
          duration?: string | null;
          photographer_count?: number | null;
          edited_photos?: string | null;
          features?: string[];
          is_popular?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          category_label: string | null;
          description: string | null;
          location: string | null;
          event_date: string | null;
          cover_image: string | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          category_label?: string | null;
          description?: string | null;
          location?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          category?: string;
          category_label?: string | null;
          description?: string | null;
          location?: string | null;
          event_date?: string | null;
          cover_image?: string | null;
          is_featured?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          aspect_ratio: 'portrait' | 'landscape' | 'square' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          aspect_ratio?: 'portrait' | 'landscape' | 'square' | null;
          created_at?: string;
        };
        Update: {
          project_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          aspect_ratio?: 'portrait' | 'landscape' | 'square' | null;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          date: string;
          status: 'available' | 'almost_full' | 'booked' | 'blocked';
          notes: string | null;
          wedding_slots: Json | null;
          booked_time_slots: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          status?: 'available' | 'almost_full' | 'booked' | 'blocked';
          notes?: string | null;
          wedding_slots?: Json | null;
          booked_time_slots?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          status?: 'available' | 'almost_full' | 'booked' | 'blocked';
          notes?: string | null;
          wedding_slots?: Json | null;
          booked_time_slots?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          customer_name: string;
          whatsapp: string;
          email: string | null;
          instagram: string | null;
          service_id: string | null;
          service_name: string | null;
          package_id: string | null;
          package_name: string | null;
          booking_date: string;
          start_time: string | null;
          end_time: string | null;
          slot_type: string | null;
          location: string | null;
          event_type: string | null;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'unpaid' | 'dp_paid' | 'paid_full' | null;
          down_payment: number | null;
          paid_amount: number | null;
          remaining_amount: number | null;
          total_price: number | null;
          drive_folder_id?: string | null;
          drive_folder_url?: string | null;
          selection_max_count?: number | null;
          selection_deadline?: string | null;
          allow_download?: boolean;
          gallery_slug?: string | null;
          gallery_token?: string | null;
          gallery_sent_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          customer_name: string;
          whatsapp: string;
          email?: string | null;
          instagram?: string | null;
          service_id?: string | null;
          service_name?: string | null;
          package_id?: string | null;
          package_name?: string | null;
          booking_date: string;
          start_time?: string | null;
          end_time?: string | null;
          slot_type?: string | null;
          location?: string | null;
          event_type?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'unpaid' | 'dp_paid' | 'paid_full' | null;
          down_payment?: number | null;
          paid_amount?: number | null;
          remaining_amount?: number | null;
          total_price?: number | null;
          drive_folder_id?: string | null;
          drive_folder_url?: string | null;
          selection_max_count?: number | null;
          selection_deadline?: string | null;
          allow_download?: boolean;
          gallery_slug?: string | null;
          gallery_token?: string | null;
          gallery_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_name?: string;
          whatsapp?: string;
          email?: string | null;
          instagram?: string | null;
          service_id?: string | null;
          service_name?: string | null;
          package_id?: string | null;
          package_name?: string | null;
          booking_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          slot_type?: string | null;
          location?: string | null;
          event_type?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'unpaid' | 'dp_paid' | 'paid_full' | null;
          down_payment?: number | null;
          paid_amount?: number | null;
          remaining_amount?: number | null;
          total_price?: number | null;
          drive_folder_id?: string | null;
          drive_folder_url?: string | null;
          selection_max_count?: number | null;
          selection_deadline?: string | null;
          allow_download?: boolean;
          gallery_slug?: string | null;
          gallery_token?: string | null;
          gallery_sent_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_files_cache: {
        Row: {
          id: string;
          booking_id: string;
          drive_file_id: string;
          file_name: string;
          thumbnail_link: string | null;
          image_width: number | null;
          image_height: number | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          drive_file_id: string;
          file_name: string;
          thumbnail_link?: string | null;
          image_width?: number | null;
          image_height?: number | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          drive_file_id?: string;
          file_name?: string;
          thumbnail_link?: string | null;
          image_width?: number | null;
          image_height?: number | null;
          fetched_at?: string;
        };
        Relationships: [];
      };
      gallery_selections: {
        Row: {
          id: string;
          booking_id: string;
          drive_file_id: string;
          file_name: string;
          selected_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          drive_file_id: string;
          file_name: string;
          selected_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          drive_file_id?: string;
          file_name?: string;
          selected_at?: string;
        };
        Relationships: [];
      };
      studio_settings: {
        Row: {
          id: string;
          studio_name: string | null;
          owner_name: string | null;
          whatsapp: string | null;
          instagram: string | null;
          tiktok: string | null;
          email: string | null;
          address: string | null;
          google_maps_url: string | null;
          bank_name: string | null;
          bank_account_number: string | null;
          bank_account_holder: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          studio_name?: string | null;
          owner_name?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          email?: string | null;
          address?: string | null;
          google_maps_url?: string | null;
          bank_name?: string | null;
          bank_account_number?: string | null;
          bank_account_holder?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          studio_name?: string | null;
          owner_name?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          email?: string | null;
          address?: string | null;
          google_maps_url?: string | null;
          bank_name?: string | null;
          bank_account_number?: string | null;
          bank_account_holder?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          booking_code: string | null;
          name: string;
          event_type: string;
          location: string | null;
          message: string;
          rating: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code?: string | null;
          name: string;
          event_type: string;
          location?: string | null;
          message: string;
          rating?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string | null;
          name?: string;
          event_type?: string;
          location?: string | null;
          message?: string;
          rating?: number;
          is_published?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          type: 'expense' | 'income';
          date: string;
          title: string;
          category: string;
          custom_category: string | null;
          amount: number;
          booking_id: string | null;
          booking_code: string | null;
          customer_name: string | null;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: 'expense' | 'income';
          date?: string;
          title: string;
          category: string;
          custom_category?: string | null;
          amount?: number;
          booking_id?: string | null;
          booking_code?: string | null;
          customer_name?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'expense' | 'income';
          date?: string;
          title?: string;
          category?: string;
          custom_category?: string | null;
          amount?: number;
          booking_id?: string | null;
          booking_code?: string | null;
          customer_name?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          type: 'booking' | 'testimonial' | 'gallery_selection';
          title: string;
          body: string | null;
          booking_id: string | null;
          url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'booking' | 'testimonial' | 'gallery_selection';
          title: string;
          body?: string | null;
          booking_id?: string | null;
          url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'booking' | 'testimonial' | 'gallery_selection';
          title?: string;
          body?: string | null;
          booking_id?: string | null;
          url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      fcm_tokens: {
        Row: {
          id: string;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
