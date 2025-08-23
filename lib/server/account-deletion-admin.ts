import { adminDb, adminStorage, adminAuth } from '@/lib/firebase/admin'

export interface AccountDeletionResult {
  success: boolean;
  deletedItems: {
    items: number;
    files: number;
    devices: number;
    subscriptions: number;
    payments: number;
  };
  errors: string[];
}

async function deleteCollectionDocsByUser(collectionName: string, userId: string): Promise<number> {
  if (!adminDb) throw new Error('Firebase Admin not initialized')
  const snapshot = await adminDb.collection(collectionName).where('userId', '==', userId).get()
  if (snapshot.empty) return 0
  const batch = adminDb.batch()
  snapshot.docs.forEach(doc => batch.delete(doc.ref))
  await batch.commit()
  return snapshot.size
}

async function deleteUserItems(userId: string) {
  return deleteCollectionDocsByUser('items', userId)
}

async function deleteUserDevices(userId: string) {
  return deleteCollectionDocsByUser('user_devices', userId)
}

async function deleteUserSubscriptions(userId: string) {
  // Opcional: cancelar suscripción activa en proveedor externo aquí
  return deleteCollectionDocsByUser('subscriptions', userId)
}

async function deleteUserPayments(userId: string) {
  // Si prefieres conservar pagos para auditoría, devuelve 0 aquí
  return deleteCollectionDocsByUser('payments', userId)
}

async function deleteUserProfile(userId: string) {
  if (!adminDb) throw new Error('Firebase Admin not initialized')
  await adminDb.doc(`users/${userId}`).delete().catch(() => {})
}

async function deleteUserFiles(userId: string): Promise<number> {
  if (!adminStorage) throw new Error('Firebase Admin not initialized')
  // Cubrir ambos esquemas de path usados históricamente
  const prefixes = [`users/${userId}/`, `files/${userId}/`]
  const bucket = adminStorage.bucket()
  await Promise.all(
    prefixes.map((p) => bucket.deleteFiles({ prefix: p, force: true }).catch(() => {}))
  )
  return 0
}

export async function deleteUserAccountAdmin(userId: string): Promise<AccountDeletionResult> {
  const result: AccountDeletionResult = {
    success: false,
    deletedItems: { items: 0, files: 0, devices: 0, subscriptions: 0, payments: 0 },
    errors: []
  }

  try {
    try { result.deletedItems.subscriptions = await deleteUserSubscriptions(userId) } catch { result.errors.push('Error cancelando/eliminando suscripciones') }
    try { result.deletedItems.payments = await deleteUserPayments(userId) } catch { result.errors.push('Error eliminando pagos') }
    try { result.deletedItems.items = await deleteUserItems(userId) } catch { result.errors.push('Error eliminando items') }
    try { result.deletedItems.devices = await deleteUserDevices(userId) } catch { result.errors.push('Error eliminando dispositivos') }
    try { result.deletedItems.files = await deleteUserFiles(userId) } catch { result.errors.push('Error eliminando archivos') }
    try { await deleteUserProfile(userId) } catch { result.errors.push('Error eliminando perfil') }
    try { 
      if (!adminAuth) throw new Error('Firebase Admin not initialized')
      await adminAuth.deleteUser(userId) 
    } catch { result.errors.push('Error eliminando cuenta de autenticación') }

    result.success = result.errors.length === 0
  } catch (e) {
    result.errors.push('Error general eliminando cuenta')
  }

  return result
}


