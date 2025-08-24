import { NextRequest, NextResponse } from 'next/server';
import { createRecurringSubscription } from '@/lib/mercadopago/payments';
import { activateSubscription } from '@/lib/firebase/subscription-manager';
import { createSubscriptionAdmin } from '@/lib/server/subscription-admin';
import { validateMPConfig } from '@/lib/mercadopago/config';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Validar configuración de MercadoPago
    if (!validateMPConfig()) {
      return NextResponse.json(
        { error: 'Configuración de MercadoPago incompleta' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, plan } = body;

    // Validar datos requeridos
    if (!userId || !userEmail || !plan) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes: userId, userEmail, plan' },
        { status: 400 }
      );
    }

    // Validar plan válido
    if (!['premium', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan no válido. Debe ser premium o enterprise' },
        { status: 400 }
      );
    }

    // Crear suscripción en MercadoPago primero
    const mpResult = await createRecurringSubscription({
      userId,
      userEmail,
      plan,
      subscriptionId: null // Temporal, se generará en MercadoPago
    });

    if (!mpResult.success) {
      logger.error('Error creando suscripción en MercadoPago', { 
        error: mpResult.error,
        userId
      });
      
      return NextResponse.json(
        { error: mpResult.error || 'Error creando suscripción en MercadoPago' },
        { status: 500 }
      );
    }

    // Crear suscripción en Firestore con el ID de MercadoPago
    const subscriptionId = await createSubscriptionAdmin(userId, plan, mpResult.subscriptionId);
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Error creando suscripción en base de datos' },
        { status: 500 }
      );
    }

    logger.info('Suscripción creada exitosamente', {
      subscriptionId,
      mpSubscriptionId: mpResult.subscriptionId,
      userId,
      plan
    });

    // Retornar URL de pago para redireccionar al usuario
    return NextResponse.json({
      success: true,
      subscriptionId,
      initPoint: mpResult.initPoint,
      mpSubscriptionId: mpResult.subscriptionId
    });

  } catch (error) {
    logger.error('Error en API de creación de suscripción', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
