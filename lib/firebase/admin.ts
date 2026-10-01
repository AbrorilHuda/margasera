// lib/firebase/admin.ts
// Firebase Admin SDK — hanya dipakai di server (API routes / Server Actions)

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
