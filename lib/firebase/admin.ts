import '@/lib/server/node-buffer-polyfill';
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
    let privateKey = rawKey;
    
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    if (!getApps().length) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      });
    } else {
      app = getApps()[0];
    }
    
    adminAuth = getAdminAuth(app);
    adminDb = getAdminFirestore(app);
    adminStorage = getAdminStorage(app);
    
    console.log('✅ Servicios Firebase Admin configurados');
  } else {
    console.error('❌ Variables de entorno Firebase Admin faltantes');
  }
} catch (e) {
  console.error('❌ Error inicializando Firebase Admin:', e);
}

export { adminAuth, adminDb, adminStorage };


