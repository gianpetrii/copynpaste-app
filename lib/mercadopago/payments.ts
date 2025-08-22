import { Payment, PreApproval } from 'mercadopago';
import { mercadoPagoClient, MP_CONFIG, getCallbackUrls } from './config';
import { logger } from '@/lib/utils/logger';
import { PLAN_PRICES } from '@/lib/firebase/device-manager';

// Interfaces para MercadoPago
export interface CreateSubscriptionData {
  userId: string;
  userEmail: string;
  plan: 'premium' | 'enterprise';
  subscriptionId: string;
}

export interface MPPaymentResult {
  success: boolean;
  paymentId?: string;
  preferenceId?: string;
  initPoint?: string;
  error?: string;
}

export interface MPSubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  initPoint?: string;
  error?: string;
}

// Crear pago único (para testing inicial)
export const createSinglePayment = async (data: CreateSubscriptionData): Promise<MPPaymentResult> => {
  try {
    const payment = new Payment(mercadoPagoClient);
    const amount = PLAN_PRICES[data.plan];
    
    const body = {
      transaction_amount: amount,
      description: `Suscripción ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} - CopyNPaste`,
      payment_method_id: 'account_money', // Para testing, luego permitir más métodos
      payer: {
        email: data.userEmail,
        first_name: 'Usuario',
        last_name: 'CopyNPaste'
      },
      external_reference: data.subscriptionId,
      notification_url: `${MP_CONFIG.baseUrl}/api/mercadopago/webhook`,
      metadata: {
        user_id: data.userId,
        subscription_id: data.subscriptionId,
        plan: data.plan
      }
    };

    const result = await payment.create({ body });
    
    if (result.status === 'approved') {
      logger.info('Pago único creado exitosamente', { 
        paymentId: result.id, 
        userId: data.userId, 
        plan: data.plan 
      });
      
      return {
        success: true,
        paymentId: result.id?.toString(),
        initPoint: result.point_of_interaction?.transaction_data?.ticket_url
      };
    } else {
      return {
        success: false,
        error: `Estado del pago: ${result.status}`
      };
    }

  } catch (error) {
    logger.error('Error creando pago único en MercadoPago', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Crear suscripción recurrente
export const createRecurringSubscription = async (data: CreateSubscriptionData): Promise<MPSubscriptionResult> => {
  try {
    const preApproval = new PreApproval(mercadoPagoClient);
    const amount = PLAN_PRICES[data.plan];
    const callbacks = getCallbackUrls(data.subscriptionId);
    
    const body = {
      reason: `Suscripción ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} - CopyNPaste`,
      external_reference: data.subscriptionId,
      payer_email: data.userEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'ARS'
      },
      back_url: callbacks.success,
      status: 'pending'
    };

    const result = await preApproval.create({ body });
    
    logger.info('Suscripción recurrente creada en MercadoPago', { 
      preApprovalId: result.id,
      userId: data.userId,
      plan: data.plan
    });

    return {
      success: true,
      subscriptionId: result.id,
      initPoint: result.init_point
    };

  } catch (error) {
    logger.error('Error creando suscripción recurrente en MercadoPago', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Obtener estado de suscripción
export const getSubscriptionStatus = async (mpSubscriptionId: string) => {
  try {
    const preApproval = new PreApproval(mercadoPagoClient);
    const result = await preApproval.get({ preapprovalId: mpSubscriptionId });
    
    return {
      success: true,
      status: result.status,
      data: result
    };
  } catch (error) {
    logger.error('Error obteniendo estado de suscripción', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Cancelar suscripción
export const cancelSubscription = async (mpSubscriptionId: string) => {
  try {
    const preApproval = new PreApproval(mercadoPagoClient);
    
    const result = await preApproval.update({
      id: mpSubscriptionId,
      requestOptions: {
        idempotencyKey: `cancel_${mpSubscriptionId}_${Date.now()}`
      },
      body: {
        status: 'cancelled'
      }
    });
    
    logger.info('Suscripción cancelada en MercadoPago', { mpSubscriptionId });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    logger.error('Error cancelando suscripción en MercadoPago', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Procesar webhook de MercadoPago
export const processWebhook = async (data: any) => {
  try {
    logger.info('Webhook recibido de MercadoPago', { data });
    
    // Aquí procesarías los diferentes tipos de notificación
    switch (data.type) {
      case 'payment':
        // Procesar notificación de pago
        break;
      case 'preapproval':
        // Procesar notificación de suscripción
        break;
      default:
        logger.warn('Tipo de webhook no reconocido', { type: data.type });
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error procesando webhook de MercadoPago', error);
    return { success: false };
  }
};
