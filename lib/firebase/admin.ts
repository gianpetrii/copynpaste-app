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

  console.log('🔍 DEBUG Firebase Admin Init:', {
    projectId: !!projectId,
    clientEmail: !!clientEmail,
    privateKey: !!rawKey,
    storageBucket: !!storageBucket,
    appsLength: getApps().length
  });

  if (projectId && clientEmail && rawKey) {
    // Limpiar y formatear la clave privada correctamente
    let privateKey = rawKey;
    
    // Si la clave viene con comillas, quitarlas
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Reemplazar \\n con saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    console.log('🔑 Private key length:', privateKey.length);
    console.log('🔑 Private key starts with:', privateKey.substring(0, 50) + '...');
    console.log('🔑 Private key ends with:', '...' + privateKey.substring(privateKey.length - 50));
    
    // Siempre inicializar si no hay apps o si la app específica no existe
    if (!getApps().length) {
      console.log('🚀 Inicializando Firebase Admin...');
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      });
      console.log('✅ Firebase Admin inicializado');
    } else {
      app = getApps()[0];
      console.log('📱 Usando app Firebase existente');
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


