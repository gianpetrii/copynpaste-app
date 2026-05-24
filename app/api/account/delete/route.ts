import { NextRequest } from 'next/server';
import { getUserDataSummary } from '@/lib/firebase/account-deletion';
import { deleteUserAccountAdmin } from '@/lib/server/account-deletion-admin';
import { adminAuth } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, confirmationText, idToken } = body;

    if (!user || !user.uid) {
      return corsJsonResponse({ error: 'Usuario requerido' }, request, { status: 400 });
    }

    if (confirmationText !== 'ELIMINAR MI CUENTA') {
      return corsJsonResponse(
        { error: 'Texto de confirmación incorrecto' },
        request,
        { status: 400 }
      );
    }

    logger.info('Solicitud de eliminación de cuenta recibida', {
      userId: user.uid,
      email: user.email,
    });

    try {
      if (!idToken || !adminAuth) throw new Error('ID token requerido');
      const decoded = await adminAuth.verifyIdToken(idToken);
      if (decoded.uid !== user.uid) throw new Error('Token inválido para este usuario');
    } catch {
      return corsJsonResponse({ error: 'No autorizado' }, request, { status: 401 });
    }

    let dataSummary = null;
    try {
      dataSummary = await getUserDataSummary(user.uid);
    } catch {
      // best-effort
    }

    const deletionResult = await deleteUserAccountAdmin(user.uid);

    logger.info('Resultado de eliminación de cuenta', {
      userId: user.uid,
      success: deletionResult.success,
      deletedItems: deletionResult.deletedItems,
      errorsCount: deletionResult.errors.length,
      dataSummary,
    });

    return corsJsonResponse(
      {
        success: deletionResult.success,
        deletedItems: deletionResult.deletedItems,
        errors: deletionResult.errors,
        dataSummary,
      },
      request
    );
  } catch (error) {
    logger.error('Error en API de eliminación de cuenta', error);
    return corsJsonResponse({ error: 'Error interno del servidor' }, request, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return corsJsonResponse({ error: 'userId requerido' }, request, { status: 400 });
    }

    const dataSummary = await getUserDataSummary(userId);
    return corsJsonResponse(dataSummary, request);
  } catch (error) {
    logger.error('Error obteniendo resumen de datos de usuario', error);
    return corsJsonResponse({ error: 'Error obteniendo datos de usuario' }, request, { status: 500 });
  }
}
