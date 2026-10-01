// lib/firebase/client.ts
// Firebase Client SDK — hanya dipakai di sisi browser (admin dashboard)

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  try {
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
    });
    return token;
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return null;
  }
}

export { onMessage, getToken };
