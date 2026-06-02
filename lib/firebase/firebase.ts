// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } };
  return win.Capacitor?.isNativePlatform?.() ?? false;
}

let auth: Auth;
if (typeof window !== 'undefined') {
  try {
    const isNative = isCapacitorNative();
    auth = initializeAuth(firebaseApp, {
      persistence: isNative ? inMemoryPersistence : browserLocalPersistence,
      popupRedirectResolver: isNative ? undefined : browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(firebaseApp);
  }
} else {
  auth = getAuth(firebaseApp);
}

// Initialize Analytics only on client side
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(firebaseApp);
}

export { firebaseApp, db, auth, storage, analytics };
