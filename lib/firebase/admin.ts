// lib/firebase/admin.ts
// Firebase Admin SDK — hanya dipakai di server (API routes / Server Actions)

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  // Handle berbagai format: Vercel bisa kirim literal \n atau newline sungguhan
  // Hapus tanda kutip di awal/akhir jika ada (kesalahan paste di Vercel)
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const privateKey = rawKey
    .replace(/^["']|["']$/g, '')   // hapus quote di awal/akhir
    .replace(/\\n/g, '\n');         // ubah \n literal → newline

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export function getFirebaseAdminMessaging() {
  const app = getFirebaseAdmin();
  return getMessaging(app);
}
