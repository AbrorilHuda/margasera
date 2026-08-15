'use server';

import crypto from 'crypto';
import { requireAdmin } from '@/lib/actions/admin';

export interface CloudinarySignatureResult {
  success: boolean;
  error?: string;
  timestamp?: number;
  signature?: string;
  apiKey?: string;
  cloudName?: string;
  folder?: string;
}

/**
 * Server Action untuk menghasilkan tanda tangan digital (SHA-1 Signature)
 * untuk upload foto aman ke Cloudinary. Hanya dapat dipanggil oleh Admin yang sudah terautentikasi.
 */
export async function getCloudinarySignature(): Promise<CloudinarySignatureResult> {
  if (!(await requireAdmin())) {
    return { success: false, error: 'Akses ditolak. Anda harus login sebagai admin.' };
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      error: 'Konfigurasi Cloudinary belum lengkap di file .env.local (butuh NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET).',
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'margasera';

  // Cloudinary SHA-1 Signature formula: "folder=margasera&timestamp=1234567890" + apiSecret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  return {
    success: true,
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  };
}

/** Helper untuk mengekstrak public_id Cloudinary dari URL */
export async function extractCloudinaryPublicId(imageUrl: string): Promise<string | null> {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
  try {
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1];
    // Hapus versi jika ada (v12345678/)
    path = path.replace(/^v\d+\//, '');
    // Hapus ekstensi file (.jpg, .png, .webp, dll)
    const publicId = path.replace(/\.[^/.]+$/, '');
    return publicId || null;
  } catch {
    return null;
  }
}

/** Server Action untuk menghapus foto secara permanen dari Cloudinary CDN */
export async function deleteCloudinaryImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };

  const publicId = await extractCloudinaryPublicId(imageUrl);
  if (!publicId) return { success: true }; // Jika bukan foto Cloudinary, lewati

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if (!cloudName || !apiKey || !apiSecret) {
    return { success: false, error: 'Kredensial Cloudinary belum diatur di .env.local' };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok && (data.result === 'ok' || data.result === 'not found')) {
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Gagal menghapus foto dari Cloudinary' };
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
    return { success: false, error: 'Terjadi kesalahan saat menghapus foto dari Cloudinary' };
  }
}
