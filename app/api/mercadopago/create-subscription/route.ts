import { NextRequest } from 'next/server';
import { createRecurringSubscription } from '@/lib/mercadopago/payments';
import { createSubscriptionAdmin } from '@/lib/server/subscription-admin';
import { validateMPConfig } from '@/lib/mercadopago/config';
import { logger } from '@/lib/utils/logger';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    if (!validateMPConfig()) {
      return corsJsonResponse(
        { error: 'Configuración de MercadoPago incompleta' },
        request,
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, plan } = body;

    if (!userId || !userEmail || !plan) {
      return corsJsonResponse(
        { error: 'Datos requeridos faltantes: userId, userEmail, plan' },
        request,
        { status: 400 }
      );
    }

    if (!['premium', 'enterprise'].includes(plan)) {
      return corsJsonResponse(
        { error: 'Plan no válido. Debe ser premium o enterprise' },
        request,
        { status: 400 }
      );
    }

    const mpResult = await createRecurringSubscription({
      userId,
      userEmail,
      plan,
      subscriptionId: null,
    });

    if (!mpResult.success) {
      logger.error('Error creando suscripción en MercadoPago', {
        error: mpResult.error,
        userId,
      });

      return corsJsonResponse(
        { error: mpResult.error || 'Error creando suscripción en MercadoPago' },
        request,
        { status: 500 }
      );
    }

    const subscriptionId = await createSubscriptionAdmin(userId, plan, mpResult.subscriptionId);
    if (!subscriptionId) {
      return corsJsonResponse(
        { error: 'Error creando suscripción en base de datos' },
        request,
        { status: 500 }
      );
    }

    logger.info('Suscripción creada exitosamente', {
      subscriptionId,
      mpSubscriptionId: mpResult.subscriptionId,
      userId,
      plan,
    });

    return corsJsonResponse(
      {
        success: true,
        subscriptionId,
        initPoint: mpResult.initPoint,
        mpSubscriptionId: mpResult.subscriptionId,
      },
      request
    );
  } catch (error) {
    logger.error('Error en API de creación de suscripción', error);
    return corsJsonResponse({ error: 'Error interno del servidor' }, request, { status: 500 });
  }
}
