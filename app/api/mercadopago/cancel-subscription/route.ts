import { NextRequest } from 'next/server';
import { cancelSubscription as cancelMPSubscription } from '@/lib/mercadopago/payments';
import { cancelSubscriptionAdmin, getSubscriptionAdmin } from '@/lib/server/subscription-admin';
import { logger } from '@/lib/utils/logger';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, userId } = body;

    if (!subscriptionId || !userId) {
      return corsJsonResponse(
        { error: 'Datos requeridos faltantes: subscriptionId, userId' },
        request,
        { status: 400 }
      );
    }

    const subscription = await getSubscriptionAdmin(subscriptionId);
    if (!subscription) {
      return corsJsonResponse({ error: 'Suscripción no encontrada' }, request, { status: 404 });
    }

    if (subscription.userId !== userId) {
      return corsJsonResponse({ error: 'No autorizado' }, request, { status: 403 });
    }

    // Cancelar en MercadoPago si existe el ID
    if (subscription.mercadoPagoSubscriptionId) {
      const mpResult = await cancelMPSubscription(subscription.mercadoPagoSubscriptionId);
      if (!mpResult.success) {
        logger.warn('No se pudo cancelar en MercadoPago, continuando con Firestore', {
          error: mpResult.error,
          subscriptionId,
        });
      }
    }

    // Cancelar en Firestore
    const cancelled = await cancelSubscriptionAdmin(subscriptionId, 'Cancelación solicitada por usuario');
    if (!cancelled) {
      return corsJsonResponse(
        { error: 'Error cancelando suscripción' },
        request,
        { status: 500 }
      );
    }

    logger.info('Suscripción cancelada exitosamente', { subscriptionId, userId });
    return corsJsonResponse({ success: true }, request);
  } catch (error) {
    logger.error('Error en API de cancelación de suscripción', error);
    return corsJsonResponse({ error: 'Error interno del servidor' }, request, { status: 500 });
  }
}
