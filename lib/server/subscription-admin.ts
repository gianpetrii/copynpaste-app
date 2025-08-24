import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';
import { PLAN_PRICES } from '@/lib/firebase/device-manager';

// Crear suscripción usando Firebase Admin (solo para APIs del servidor)
export const createSubscriptionAdmin = async (
  userId: string,
  plan: 'premium' | 'enterprise',
  mercadoPagoSubscriptionId?: string
): Promise<string | null> => {
  try {
    // Debug: Ver estado de Firebase Admin
    logger.info('DEBUG: Estado Firebase Admin', { 
      adminDbExists: !!adminDb,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmailExists: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY
    });
    
    if (!adminDb) {
      throw new Error('Firebase Admin no inicializado');
    }

    const subscriptionId = `sub_${userId}_${Date.now()}`;
    const amount = PLAN_PRICES[plan];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Mensual
    
    await adminDb.collection('subscriptions').doc(subscriptionId).set({
      id: subscriptionId,
      userId,
      plan,
      status: 'pending',
      amount,
      currency: 'ARS',
      billingCycle: 'monthly',
      startDate,
      endDate,
      nextBillingDate: endDate,
      mercadoPagoSubscriptionId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    logger.info('Suscripción creada con Admin', { subscriptionId, userId, plan, amount });
    return subscriptionId;
  } catch (error) {
    logger.error('Error al crear suscripción con Admin', { error, userId });
    return null;
  }
};
