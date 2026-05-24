import { NextRequest } from 'next/server';
import { getSubscriptionStatus } from '@/lib/mercadopago/payments';
import { activateSubscription, cancelSubscription } from '@/lib/firebase/subscription-manager';
import { logger } from '@/lib/utils/logger';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('Webhook recibido de MercadoPago', {
      type: body.type,
      id: body.id,
      data: body.data,
    });

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

    return corsJsonResponse({ received: true }, request);
  } catch (error) {
    logger.error('Error procesando webhook de MercadoPago', error);
    return corsJsonResponse({ received: true }, request);
  }
}

async function handlePreApprovalWebhook(webhookData: any) {
  try {
    const preApprovalId = webhookData.data?.id;
    if (!preApprovalId) return;

    const statusResult = await getSubscriptionStatus(preApprovalId);
    if (!statusResult.success) return;

    const status = statusResult.data?.status;
    const externalReference = statusResult.data?.external_reference;

    logger.info('Estado de suscripción recibido', {
      preApprovalId,
      status,
      externalReference,
    });

    switch (status) {
      case 'authorized':
        if (externalReference) {
          await activateSubscription(externalReference);
          logger.info('Suscripción activada por webhook', {
            subscriptionId: externalReference,
            preApprovalId,
          });
        }
        break;

      case 'cancelled':
        if (externalReference) {
          await cancelSubscription(externalReference, 'Cancelada por usuario en MercadoPago');
          logger.info('Suscripción cancelada por webhook', {
            subscriptionId: externalReference,
            preApprovalId,
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

    logger.info('Webhook de pago recibido', { paymentId });
  } catch (error) {
    logger.error('Error manejando webhook de payment', error);
  }
}
