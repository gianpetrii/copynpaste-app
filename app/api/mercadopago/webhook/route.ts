import { NextRequest, NextResponse } from 'next/server';
import { processWebhook, getSubscriptionStatus } from '@/lib/mercadopago/payments';
import { activateSubscription, cancelSubscription } from '@/lib/firebase/subscription-manager';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Webhook recibido de MercadoPago', { 
      type: body.type,
      id: body.id,
      data: body.data 
    });

    // Procesar según el tipo de notificación
    switch (body.type) {
      case 'preapproval':
        await handlePreApprovalWebhook(body);
        break;
      case 'payment':
        await handlePaymentWebhook(body);
        break;
      default:
        logger.warn('Tipo de webhook no manejado', { type: body.type });
    }

    // MercadoPago espera una respuesta HTTP 200
    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('Error procesando webhook de MercadoPago', error);
    // Aún así devolver 200 para evitar reintentos innecesarios
    return NextResponse.json({ received: true });
  }
}

async function handlePreApprovalWebhook(webhookData: any) {
  try {
    const preApprovalId = webhookData.data?.id;
    if (!preApprovalId) return;

    // Obtener estado actual de la suscripción
    const statusResult = await getSubscriptionStatus(preApprovalId);
    if (!statusResult.success) return;

    const status = statusResult.data?.status;
    const externalReference = statusResult.data?.external_reference;

    logger.info('Estado de suscripción recibido', {
      preApprovalId,
      status,
      externalReference
    });

    // Procesar según el estado
    switch (status) {
      case 'authorized':
        // Suscripción aprobada - activar
        if (externalReference) {
          await activateSubscription(externalReference);
          logger.info('Suscripción activada por webhook', { 
            subscriptionId: externalReference,
            preApprovalId 
          });
        }
        break;
        
      case 'cancelled':
        // Suscripción cancelada
        if (externalReference) {
          await cancelSubscription(externalReference, 'Cancelada por usuario en MercadoPago');
          logger.info('Suscripción cancelada por webhook', { 
            subscriptionId: externalReference,
            preApprovalId 
          });
        }
        break;
        
      default:
        logger.info('Estado de suscripción no requiere acción', { status });
    }

  } catch (error) {
    logger.error('Error manejando webhook de preapproval', error);
  }
}

async function handlePaymentWebhook(webhookData: any) {
  try {
    const paymentId = webhookData.data?.id;
    if (!paymentId) return;

    // Aquí podrías obtener detalles del pago si necesitas
    logger.info('Webhook de pago recibido', { paymentId });
    
    // Por ahora solo logueamos, pero podrías:
    // - Verificar el estado del pago
    // - Activar funcionalidades premium si es necesario
    // - Enviar confirmación por email

  } catch (error) {
    logger.error('Error manejando webhook de payment', error);
  }
}
