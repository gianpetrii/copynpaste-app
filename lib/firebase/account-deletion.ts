import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  writeBatch
} from 'firebase/firestore';
import { deleteObject, ref, listAll } from 'firebase/storage';
import { deleteUser } from 'firebase/auth';
import { db, storage } from './firebase';
import { logger } from '@/lib/utils/logger';
import { getUserSubscription, cancelSubscription } from './subscription-manager';
import { cancelSubscription as cancelMPSubscription } from '@/lib/mercadopago/payments';

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

// Eliminar todos los items del usuario
async function deleteUserItems(userId: string): Promise<number> {
  try {
    const itemsQuery = query(collection(db, 'items'), where('userId', '==', userId));
    const itemsSnapshot = await getDocs(itemsQuery);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    itemsSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    logger.info(`Items eliminados para usuario: ${deletedCount}`, { userId });
    return deletedCount;
  } catch (error) {
    logger.error('Error eliminando items del usuario', error);
    throw error;
  }
}

// Eliminar todos los archivos del usuario en Storage
async function deleteUserFiles(userId: string): Promise<number> {
  try {
    const userFilesRef = ref(storage, `users/${userId}`);
    const filesList = await listAll(userFilesRef);
    
    let deletedCount = 0;
    
    // Eliminar archivos en paralelo
    const deletePromises = filesList.items.map(async (fileRef) => {
      try {
        await deleteObject(fileRef);
        deletedCount++;
      } catch (error) {
        logger.warn(`Error eliminando archivo: ${fileRef.fullPath}`, { error });
      }
    });
    
    // Eliminar subcarpetas recursivamente
    const deleteFolderPromises = filesList.prefixes.map(async (folderRef) => {
      try {
        const subFilesList = await listAll(folderRef);
        const subDeletePromises = subFilesList.items.map(fileRef => deleteObject(fileRef));
        await Promise.all(subDeletePromises);
        deletedCount += subFilesList.items.length;
      } catch (error) {
        logger.warn(`Error eliminando carpeta: ${folderRef.fullPath}`, { error });
      }
    });
    
    await Promise.all([...deletePromises, ...deleteFolderPromises]);
    
    logger.info(`Archivos eliminados para usuario: ${deletedCount}`, { userId });
    return deletedCount;
  } catch (error) {
    logger.error('Error eliminando archivos del usuario', error);
    throw error;
  }
}

// Eliminar dispositivos del usuario
async function deleteUserDevices(userId: string): Promise<number> {
  try {
    const devicesQuery = query(collection(db, 'user_devices'), where('userId', '==', userId));
    const devicesSnapshot = await getDocs(devicesQuery);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    devicesSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    logger.info(`Dispositivos eliminados para usuario: ${deletedCount}`, { userId });
    return deletedCount;
  } catch (error) {
    logger.error('Error eliminando dispositivos del usuario', error);
    throw error;
  }
}

// Cancelar y eliminar suscripciones del usuario
async function deleteUserSubscriptions(userId: string): Promise<number> {
  try {
    // Obtener suscripción activa
    const activeSubscription = await getUserSubscription(userId);
    
    if (activeSubscription) {
      // Cancelar en MercadoPago si existe
      if (activeSubscription.mercadoPagoSubscriptionId) {
        await cancelMPSubscription(activeSubscription.mercadoPagoSubscriptionId);
      }
      
      // Cancelar en nuestro sistema
      await cancelSubscription(activeSubscription.id, 'Cuenta eliminada por usuario');
    }
    
    // Eliminar todas las suscripciones del usuario
    const subscriptionsQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId));
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    subscriptionsSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    logger.info(`Suscripciones eliminadas para usuario: ${deletedCount}`, { userId });
    return deletedCount;
  } catch (error) {
    logger.error('Error eliminando suscripciones del usuario', error);
    throw error;
  }
}

// Eliminar historial de pagos del usuario
async function deleteUserPayments(userId: string): Promise<number> {
  try {
    const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', userId));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    paymentsSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    logger.info(`Pagos eliminados para usuario: ${deletedCount}`, { userId });
    return deletedCount;
  } catch (error) {
    logger.error('Error eliminando pagos del usuario', error);
    throw error;
  }
}

// Eliminar perfil de usuario
async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    logger.info('Perfil de usuario eliminado', { userId });
  } catch (error) {
    logger.error('Error eliminando perfil de usuario', error);
    throw error;
  }
}

// Función principal para eliminar cuenta completa
export async function deleteUserAccount(user: any): Promise<AccountDeletionResult> {
  const userId = user.uid;
  const result: AccountDeletionResult = {
    success: false,
    deletedItems: {
      items: 0,
      files: 0,
      devices: 0,
      subscriptions: 0,
      payments: 0
    },
    errors: []
  };
  
  logger.info('Iniciando eliminación de cuenta', { userId, email: user.email });
  
  try {
    // 1. Cancelar y eliminar suscripciones (primero para evitar cargos)
    try {
      result.deletedItems.subscriptions = await deleteUserSubscriptions(userId);
    } catch (error) {
      result.errors.push('Error cancelando suscripciones');
      logger.error('Error en cancelación de suscripciones', error);
    }
    
    // 2. Eliminar historial de pagos
    try {
      result.deletedItems.payments = await deleteUserPayments(userId);
    } catch (error) {
      result.errors.push('Error eliminando historial de pagos');
      logger.error('Error eliminando pagos', error);
    }
    
    // 3. Eliminar items del usuario
    try {
      result.deletedItems.items = await deleteUserItems(userId);
    } catch (error) {
      result.errors.push('Error eliminando items guardados');
      logger.error('Error eliminando items', error);
    }
    
    // 4. Eliminar archivos del usuario
    try {
      result.deletedItems.files = await deleteUserFiles(userId);
    } catch (error) {
      result.errors.push('Error eliminando archivos');
      logger.error('Error eliminando archivos', error);
    }
    
    // 5. Eliminar dispositivos del usuario
    try {
      result.deletedItems.devices = await deleteUserDevices(userId);
    } catch (error) {
      result.errors.push('Error eliminando dispositivos');
      logger.error('Error eliminando dispositivos', error);
    }
    
    // 6. Eliminar perfil de usuario
    try {
      await deleteUserProfile(userId);
    } catch (error) {
      result.errors.push('Error eliminando perfil');
      logger.error('Error eliminando perfil', error);
    }
    
    // 7. Eliminar cuenta de Firebase Auth (último paso)
    try {
      await deleteUser(user);
      logger.info('Cuenta de Firebase Auth eliminada', { userId });
    } catch (error) {
      result.errors.push('Error eliminando cuenta de autenticación');
      logger.error('Error eliminando cuenta de auth', error);
    }
    
    // Determinar si fue exitoso
    result.success = result.errors.length === 0;
    
    logger.info('Eliminación de cuenta completada', { 
      userId, 
      success: result.success, 
      deletedItems: result.deletedItems,
      errorsCount: result.errors.length 
    });
    
    return result;
    
  } catch (error) {
    result.errors.push('Error general en eliminación de cuenta');
    logger.error('Error general eliminando cuenta', error);
    return result;
  }
}

// Función para obtener resumen de datos antes de eliminar
export async function getUserDataSummary(userId: string) {
  try {
    const [itemsSnapshot, devicesSnapshot, subscriptionsSnapshot, paymentsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'items'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'user_devices'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'subscriptions'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'payments'), where('userId', '==', userId)))
    ]);
    
    // Calcular tamaño total de archivos
    let totalFileSize = 0;
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fileSize) {
        totalFileSize += data.fileSize;
      }
    });
    
    return {
      totalItems: itemsSnapshot.size,
      totalDevices: devicesSnapshot.size,
      totalSubscriptions: subscriptionsSnapshot.size,
      totalPayments: paymentsSnapshot.size,
      totalFileSize: totalFileSize,
      totalFileSizeMB: Math.round(totalFileSize / (1024 * 1024) * 100) / 100
    };
  } catch (error) {
    logger.error('Error obteniendo resumen de datos de usuario', error);
    throw error;
  }
}
