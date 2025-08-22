import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { logger } from '@/lib/utils/logger';

// Interfaz para información del dispositivo
export interface DeviceInfo {
  id: string;
  userId: string;
  deviceName: string;
  userAgent: string;
  lastActive: Timestamp;
  createdAt: Timestamp;
  ipHash?: string; // Hash de la IP para mayor seguridad
}

// Interfaz para límites de plan
export interface PlanLimits {
  maxDevices: number;
  maxItems: number;
  maxStorage: number; // en MB
}

// Límites por plan
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxDevices: 2,
    maxItems: 25,
    maxStorage: 50 // 50MB
  },
  premium: {
    maxDevices: 5,
    maxItems: 500,
    maxStorage: 2048 // 2GB
  },
  enterprise: {
    maxDevices: -1, // Ilimitado
    maxItems: -1, // Ilimitado
    maxStorage: -1 // Ilimitado
  }
};

// Precios por plan (en ARS)
export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  premium: 1000, // $1,000 ARS/mes
  enterprise: 2500 // $2,500 ARS/mes
};

// Generar ID único del dispositivo basado en información del navegador
export const generateDeviceId = (): string => {
  const userAgent = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  // Crear un hash simple con información del dispositivo
  const deviceString = `${userAgent}-${screen}-${timezone}-${language}`;
  
  // Generar hash simple (no criptográfico, solo para identificación)
  let hash = 0;
  for (let i = 0; i < deviceString.length; i++) {
    const char = deviceString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Obtener nombre descriptivo del dispositivo
export const getDeviceName = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar SO
  let os = 'Unknown OS';
  if (userAgent.includes('windows')) os = 'Windows';
  else if (userAgent.includes('mac')) os = 'macOS';
  else if (userAgent.includes('linux')) os = 'Linux';
  else if (userAgent.includes('android')) os = 'Android';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'iOS';
  
  // Detectar navegador
  let browser = 'Unknown Browser';
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) browser = 'Chrome';
  else if (userAgent.includes('firefox')) browser = 'Firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'Safari';
  else if (userAgent.includes('edg')) browser = 'Edge';
  
  return `${browser} en ${os}`;
};

// Registrar nuevo dispositivo
export const registerDevice = async (userId: string): Promise<boolean> => {
  try {
    const deviceId = generateDeviceId();
    const deviceName = getDeviceName();
    
    // Verificar límites del plan del usuario
    const userPlan = await getUserPlan(userId);
    const planLimits = PLAN_LIMITS[userPlan];
    
    if (planLimits.maxDevices > 0) {
      const currentDevices = await getUserDevices(userId);
      
      // Si ya existe este dispositivo, solo actualizar último acceso
      const existingDevice = currentDevices.find(d => d.id === deviceId);
      if (existingDevice) {
        await updateDeviceLastActive(userId, deviceId);
        return true;
      }
      
      // Si excede el límite, remover dispositivos más antiguos
      if (currentDevices.length >= planLimits.maxDevices) {
        const devicesToRemove = currentDevices
          .sort((a, b) => a.lastActive.seconds - b.lastActive.seconds)
          .slice(0, currentDevices.length - planLimits.maxDevices + 1);
        
        for (const device of devicesToRemove) {
          await removeDevice(userId, device.id);
        }
      }
    }
    
    // Registrar nuevo dispositivo
    const deviceRef = doc(db, 'user_devices', `${userId}_${deviceId}`);
    await setDoc(deviceRef, {
      id: deviceId,
      userId: userId,
      deviceName: deviceName,
      userAgent: navigator.userAgent,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    logger.info('Dispositivo registrado', { deviceId, deviceName, userId });
    return true;
    
  } catch (error) {
    logger.authError('Error al registrar dispositivo', error);
    return false;
  }
};

// Obtener dispositivos del usuario
export const getUserDevices = async (userId: string): Promise<DeviceInfo[]> => {
  try {
    const q = query(
      collection(db, 'user_devices'),
      where('userId', '==', userId),
      orderBy('lastActive', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const devices: DeviceInfo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: data.id,
        userId: data.userId,
        deviceName: data.deviceName,
        userAgent: data.userAgent,
        lastActive: data.lastActive,
        createdAt: data.createdAt,
        ipHash: data.ipHash
      });
    });
    
    return devices;
  } catch (error) {
    logger.databaseError('Error al obtener dispositivos', error);
    return [];
  }
};

// Actualizar último acceso del dispositivo
export const updateDeviceLastActive = async (userId: string, deviceId: string): Promise<void> => {
  try {
    const deviceRef = doc(db, 'user_devices', `${userId}_${deviceId}`);
    await setDoc(deviceRef, {
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    logger.databaseError('Error al actualizar dispositivo', error);
  }
};

// Remover dispositivo
export const removeDevice = async (userId: string, deviceId: string): Promise<boolean> => {
  try {
    const deviceRef = doc(db, 'user_devices', `${userId}_${deviceId}`);
    await deleteDoc(deviceRef);
    
    logger.info('Dispositivo removido', { deviceId, userId });
    return true;
  } catch (error) {
    logger.databaseError('Error al remover dispositivo', error);
    return false;
  }
};

// Verificar si el usuario puede usar este dispositivo
export const canUseDevice = async (userId: string): Promise<boolean> => {
  try {
    const currentDeviceId = generateDeviceId();
    const userPlan = await getUserPlan(userId);
    const planLimits = PLAN_LIMITS[userPlan];
    
    // Sin límite en enterprise
    if (planLimits.maxDevices === -1) return true;
    
    const currentDevices = await getUserDevices(userId);
    
    // Si este dispositivo ya está registrado, permitir acceso
    const isRegistered = currentDevices.some(d => d.id === currentDeviceId);
    if (isRegistered) return true;
    
    // Si hay espacio para más dispositivos, permitir
    return currentDevices.length < planLimits.maxDevices;
    
  } catch (error) {
    logger.authError('Error al verificar dispositivo', error);
    return true; // En caso de error, permitir acceso
  }
};

// Obtener plan del usuario - ahora conectado con sistema de suscripciones
export const getUserPlan = async (userId: string): Promise<string> => {
  try {
    // Importar dinámicamente para evitar dependencia circular
    const { getUserProfile } = await import('./subscription-manager');
    const profile = await getUserProfile(userId);
    return profile?.plan || 'free';
  } catch (error) {
    logger.databaseError('Error al obtener plan de usuario desde device-manager', error, undefined, userId);
    return 'free';
  }
};

// Limpiar dispositivos inactivos (ejecutar periódicamente)
export const cleanupInactiveDevices = async (userId: string, daysInactive = 30): Promise<void> => {
  try {
    const devices = await getUserDevices(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    for (const device of devices) {
      const lastActiveDate = device.lastActive.toDate();
      if (lastActiveDate < cutoffDate) {
        await removeDevice(userId, device.id);
      }
    }
  } catch (error) {
    logger.databaseError('Error al limpiar dispositivos inactivos', error);
  }
}; 