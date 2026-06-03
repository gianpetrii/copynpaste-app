import { adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';
import { PLAN_PRICES } from '@/lib/firebase/device-manager';

// Crear suscripción usando Firebase Admin (solo para APIs del servidor)
export const createSubscriptionAdmin = async (
  userId: string,
  plan: 'premium' | 'enterprise',
  mercadoPagoSubscriptionId?: string,
  predefinedId?: string
): Promise<string | null> => {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin no inicializado');
    }

    const subscriptionId = predefinedId || `sub_${userId}_${Date.now()}`;
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

// Activar suscripción usando Firebase Admin
export const activateSubscriptionAdmin = async (subscriptionId: string): Promise<boolean> => {
  try {
    if (!adminDb) throw new Error('Firebase Admin no inicializado');

    const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
    const subscriptionDoc = await subscriptionRef.get();

    if (!subscriptionDoc.exists) {
      logger.error('Suscripción no encontrada para activar', { subscriptionId });
      return false;
    }

    const subscription = subscriptionDoc.data()!;

    await subscriptionRef.update({ status: 'active', updatedAt: new Date() });
    await adminDb.collection('users').doc(subscription.userId).update({
      plan: subscription.plan,
      subscriptionId,
      updatedAt: new Date(),
    });

    logger.info('Suscripción activada (admin)', { subscriptionId, userId: subscription.userId });
    return true;
  } catch (error) {
    logger.error('Error al activar suscripción (admin)', { error, subscriptionId });
    return false;
  }
};

// Cancelar suscripción en Firestore usando Firebase Admin
export const cancelSubscriptionAdmin = async (subscriptionId: string, reason?: string): Promise<boolean> => {
  try {
    if (!adminDb) throw new Error('Firebase Admin no inicializado');

    const subscriptionRef = adminDb.collection('subscriptions').doc(subscriptionId);
    const subscriptionDoc = await subscriptionRef.get();

    if (!subscriptionDoc.exists) {
      logger.error('Suscripción no encontrada para cancelar', { subscriptionId });
      return false;
    }

    const subscription = subscriptionDoc.data()!;

    await subscriptionRef.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason || 'Cancelación solicitada',
      updatedAt: new Date(),
    });
    await adminDb.collection('users').doc(subscription.userId).update({
      plan: 'free',
      updatedAt: new Date(),
    });

    logger.info('Suscripción cancelada (admin)', { subscriptionId, userId: subscription.userId });
    return true;
  } catch (error) {
    logger.error('Error al cancelar suscripción (admin)', { error, subscriptionId });
    return false;
  }
};

// Obtener suscripción por ID usando Firebase Admin
export const getSubscriptionAdmin = async (subscriptionId: string) => {
  try {
    if (!adminDb) throw new Error('Firebase Admin no inicializado');
    const doc = await adminDb.collection('subscriptions').doc(subscriptionId).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (error) {
    logger.error('Error al obtener suscripción (admin)', { error, subscriptionId });
    return null;
  }
};
