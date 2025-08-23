import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage, Storage } from 'firebase-admin/storage';

let app: App | undefined;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (projectId && clientEmail && rawKey) {
    const privateKey = rawKey.replace(/\\n/g, '\n');
    if (!getApps().length) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      });
    }
    adminAuth = getAdminAuth();
    adminDb = getAdminFirestore();
    adminStorage = getAdminStorage();
  }
} catch (e) {
  // Ignore init errors in dev if envs are missing; callers must handle nulls
}

export { adminAuth, adminDb, adminStorage };


