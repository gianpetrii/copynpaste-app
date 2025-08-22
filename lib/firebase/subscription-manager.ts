import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { logger } from '@/lib/utils/logger';
import { PLAN_LIMITS, PLAN_PRICES } from './device-manager';

// Interfaces para suscripciones
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  plan: 'free' | 'premium' | 'enterprise';
  subscriptionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  trialUsed?: boolean;
  lastLogin?: Timestamp;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'pending';
  amount: number; // En ARS
  currency: 'ARS';
  billingCycle: 'monthly';
  startDate: Timestamp;
  endDate: Timestamp;
  nextBillingDate: Timestamp;
  paymentMethodId?: string;
  mercadoPagoSubscriptionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp;
  cancelReason?: string;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: 'ARS';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer';
  mercadoPagoPaymentId?: string;
  createdAt: Timestamp;
  processedAt?: Timestamp;
  failureReason?: string;
}

// Crear o actualizar perfil de usuario
export const createUserProfile = async (uid: string, email: string, displayName?: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || '',
        plan: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        trialUsed: false
      });
      
      logger.info('Perfil de usuario creado', { uid, email });
    } else {
      // Actualizar último login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    logger.authError('Error al crear perfil de usuario', error, uid);
    return false;
  }
};

// Obtener perfil de usuario
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    logger.databaseError('Error al obtener perfil de usuario', error, undefined, uid);
    return null;
  }
};

// Obtener plan del usuario
export const getUserPlan = async (uid: string): Promise<string> => {
  try {
    const profile = await getUserProfile(uid);
    return profile?.plan || 'free';
  } catch (error) {
    logger.databaseError('Error al obtener plan de usuario', error, undefined, uid);
    return 'free';
  }
};

// Actualizar plan de usuario
export const updateUserPlan = async (uid: string, plan: 'free' | 'premium' | 'enterprise', subscriptionId?: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const updateData: any = {
      plan,
      updatedAt: serverTimestamp()
    };
    
    if (subscriptionId) {
      updateData.subscriptionId = subscriptionId;
    }
    
    await updateDoc(userRef, updateData);
    
    logger.info('Plan de usuario actualizado', { uid, plan, subscriptionId });
    return true;
  } catch (error) {
    logger.databaseError('Error al actualizar plan de usuario', error, undefined, uid);
    return false;
  }
};

// Crear suscripción
export const createSubscription = async (
  userId: string,
  plan: 'premium' | 'enterprise',
  mercadoPagoSubscriptionId?: string
): Promise<string | null> => {
  try {
    const subscriptionId = `sub_${userId}_${Date.now()}`;
    const amount = PLAN_PRICES[plan];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Mensual
    
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    await setDoc(subscriptionRef, {
      id: subscriptionId,
      userId,
      plan,
      status: 'pending',
      amount,
      currency: 'ARS',
      billingCycle: 'monthly',
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      nextBillingDate: Timestamp.fromDate(endDate),
      mercadoPagoSubscriptionId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    logger.info('Suscripción creada', { subscriptionId, userId, plan, amount });
    return subscriptionId;
  } catch (error) {
    logger.databaseError('Error al crear suscripción', error, undefined, userId);
    return null;
  }
};

// Obtener suscripción activa del usuario
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data() as Subscription;
    }
    
    return null;
  } catch (error) {
    logger.databaseError('Error al obtener suscripción de usuario', error, undefined, userId);
    return null;
  }
};

// Activar suscripción
export const activateSubscription = async (subscriptionId: string, paymentId?: string): Promise<boolean> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error('Suscripción no encontrada');
    }
    
    const subscription = subscriptionDoc.data() as Subscription;
    
    // Actualizar suscripción
    await updateDoc(subscriptionRef, {
      status: 'active',
      updatedAt: serverTimestamp()
    });
    
    // Actualizar plan del usuario
    await updateUserPlan(subscription.userId, subscription.plan, subscriptionId);
    
    // Registrar pago si se proporciona
    if (paymentId) {
      await recordPayment(subscription.userId, subscriptionId, subscription.amount, 'approved', paymentId);
    }
    
    logger.info('Suscripción activada', { subscriptionId, userId: subscription.userId });
    return true;
  } catch (error) {
    logger.databaseError('Error al activar suscripción', error, subscriptionId);
    return false;
  }
};

// Cancelar suscripción
export const cancelSubscription = async (subscriptionId: string, reason?: string): Promise<boolean> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error('Suscripción no encontrada');
    }
    
    const subscription = subscriptionDoc.data() as Subscription;
    
    // Actualizar suscripción
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelReason: reason || 'Usuario solicitó cancelación',
      updatedAt: serverTimestamp()
    });
    
    // Downgrade a plan gratuito
    await updateUserPlan(subscription.userId, 'free');
    
    logger.info('Suscripción cancelada', { subscriptionId, userId: subscription.userId, reason });
    return true;
  } catch (error) {
    logger.databaseError('Error al cancelar suscripción', error, subscriptionId);
    return false;
  }
};

// Registrar pago
export const recordPayment = async (
  userId: string,
  subscriptionId: string,
  amount: number,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  mercadoPagoPaymentId?: string,
  paymentMethod?: 'credit_card' | 'debit_card' | 'bank_transfer'
): Promise<string | null> => {
  try {
    const paymentId = `pay_${userId}_${Date.now()}`;
    const paymentRef = doc(db, 'payments', paymentId);
    
    await setDoc(paymentRef, {
      id: paymentId,
      userId,
      subscriptionId,
      amount,
      currency: 'ARS',
      status,
      paymentMethod: paymentMethod || 'credit_card',
      mercadoPagoPaymentId,
      createdAt: serverTimestamp(),
      processedAt: status === 'approved' ? serverTimestamp() : null
    });
    
    logger.info('Pago registrado', { paymentId, userId, amount, status });
    return paymentId;
  } catch (error) {
    logger.databaseError('Error al registrar pago', error, undefined, userId);
    return null;
  }
};

// Verificar si el usuario puede usar funcionalidades premium
export const canUsePremiumFeatures = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;
    
    if (profile.plan === 'free') return false;
    
    // Verificar si la suscripción está activa
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;
    
    // Verificar si la suscripción no ha expirado
    const now = new Date();
    const endDate = subscription.endDate.toDate();
    
    return subscription.status === 'active' && endDate > now;
  } catch (error) {
    logger.databaseError('Error al verificar funcionalidades premium', error, undefined, userId);
    return false;
  }
};

// Obtener estadísticas de suscripciones para admin
export const getSubscriptionStats = async () => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const usersRef = collection(db, 'users');
    
    const [subscriptionsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(subscriptionsRef),
      getDocs(usersRef)
    ]);
    
    const stats = {
      totalUsers: usersSnapshot.size,
      totalSubscriptions: subscriptionsSnapshot.size,
      activeSubscriptions: 0,
      premiumUsers: 0,
      enterpriseUsers: 0,
      monthlyRevenue: 0
    };
    
    usersSnapshot.forEach((doc) => {
      const user = doc.data() as UserProfile;
      if (user.plan === 'premium') stats.premiumUsers++;
      if (user.plan === 'enterprise') stats.enterpriseUsers++;
    });
    
    subscriptionsSnapshot.forEach((doc) => {
      const subscription = doc.data() as Subscription;
      if (subscription.status === 'active') {
        stats.activeSubscriptions++;
        stats.monthlyRevenue += subscription.amount;
      }
    });
    
    return stats;
  } catch (error) {
    logger.databaseError('Error al obtener estadísticas de suscripciones', error);
    return null;
  }
};
