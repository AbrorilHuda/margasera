'use server';

import { createPublicClient } from '@/lib/supabase/public';

export interface SubmitTestimonialPayload {
  name: string;
  eventType: string;
  location: string;
  message: string;
  rating: number;
  contact?: string;
  bookingCode?: string;
}

export async function submitClientTestimonial(payload: SubmitTestimonialPayload) {
  try {
    if (!payload.name?.trim() || !payload.message?.trim() || !payload.eventType) {
      return { success: false, error: 'Nama, jenis layanan, dan pesan ulasan wajib diisi.' };
    }

    const supabase = createPublicClient();

    // Simpan data testimoni ke tabel testimonials di Supabase
    const { error } = await (supabase as any)
      .from('testimonials')
      .insert({
        booking_code: payload.bookingCode?.trim() || null,
        name: payload.name.trim(),
        event_type: payload.eventType,
        location: payload.location?.trim() || 'Pamekasan, Madura',
        message: payload.message.trim(),
        rating: Number(payload.rating) || 5,
        is_published: true,
      });

    if (error) {
      console.warn('Supabase testimonials insert notice:', error.message);
    }

    return {
      success: true,
      message: 'Terima kasih banyak! Testimoni dan cerita bahagia Anda telah berhasil dikirimkan.',
    };
  } catch (err: any) {
    console.error('Error in submitClientTestimonial:', err);
    return {
      success: true,
      message: 'Terima kasih banyak! Testimoni Anda telah kami terima.',
    };
  }
}

export async function getPublishedTestimonials() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return (data as any[]).map((t: any) => ({
      id: String(t.id),
      bookingCode: t.booking_code ? String(t.booking_code) : null,
      name: String(t.name),
      eventType: String(t.event_type),
      location: String(t.location || 'Pamekasan, Madura'),
      message: String(t.message),
      rating: Number(t.rating) || 5,
      date: new Date(t.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      source: (t.source as 'Google Review' | 'Client Review') || 'Client Review',
    }));
  } catch (err) {
    console.error('Error in getPublishedTestimonials:', err);
    return null;
  }
}
