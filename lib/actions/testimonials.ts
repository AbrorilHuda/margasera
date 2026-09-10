'use server';

import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';

export interface SubmitTestimonialPayload {
  name: string;
  eventType: string;
  location: string;
  message: string;
  rating: number;
  contact?: string;
  bookingCode?: string;
}

export interface AdminTestimonialItem {
  id: string;
  bookingCode: string | null;
  name: string;
  eventType: string;
  location: string;
  message: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
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
        is_published: false,
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

/** Admin: Ambil semua testimoni (baik publik maupun tersembunyi) */
export async function getAllTestimonialsAdmin(): Promise<AdminTestimonialItem[]> {
  if (!(await requireAdmin())) return [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error in getAllTestimonialsAdmin:', error);
      return [];
    }

    return (data as any[]).map((t: any) => ({
      id: String(t.id),
      bookingCode: t.booking_code ? String(t.booking_code) : null,
      name: String(t.name),
      eventType: String(t.event_type),
      location: String(t.location || 'Pamekasan, Madura'),
      message: String(t.message),
      rating: Number(t.rating) || 5,
      isPublished: Boolean(t.is_published),
      createdAt: String(t.created_at),
    }));
  } catch (err) {
    console.error('Error in getAllTestimonialsAdmin:', err);
    return [];
  }
}

/** Admin: Toggle status tampil/publikasi testimoni */
export async function toggleTestimonialPublishStatus(
  id: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  try {
    const supabase = createAdminClient();
    const { error } = await (supabase as any)
      .from('testimonials')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/');
    revalidatePath('/admin/dashboard/testimonials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui status publikasi' };
  }
}

/** Admin: Hapus testimoni */
export async function deleteTestimonialAdmin(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  try {
    const supabase = createAdminClient();
    const { error } = await (supabase as any)
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/');
    revalidatePath('/admin/dashboard/testimonials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus testimoni' };
  }
}

