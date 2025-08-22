import { NextRequest, NextResponse } from 'next/server';
import { deleteUserAccount, getUserDataSummary } from '@/lib/firebase/account-deletion';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, confirmationText } = body;

    // Validar datos requeridos
    if (!user || !user.uid) {
      return NextResponse.json(
        { error: 'Usuario requerido' },
        { status: 400 }
      );
    }

    // Validar texto de confirmación
    if (confirmationText !== 'ELIMINAR MI CUENTA') {
      return NextResponse.json(
        { error: 'Texto de confirmación incorrecto' },
        { status: 400 }
      );
    }

    logger.info('Solicitud de eliminación de cuenta recibida', { 
      userId: user.uid, 
      email: user.email 
    });

    // Obtener resumen antes de eliminar
    let dataSummary;
    try {
      dataSummary = await getUserDataSummary(user.uid);
    } catch (error) {
      logger.warn('No se pudo obtener resumen de datos', error);
      dataSummary = null;
    }

    // Proceder con la eliminación
    const deletionResult = await deleteUserAccount(user);

    // Log del resultado
    logger.info('Resultado de eliminación de cuenta', {
      userId: user.uid,
      success: deletionResult.success,
      deletedItems: deletionResult.deletedItems,
      errorsCount: deletionResult.errors.length,
      dataSummary
    });

    return NextResponse.json({
      success: deletionResult.success,
      deletedItems: deletionResult.deletedItems,
      errors: deletionResult.errors,
      dataSummary
    });

  } catch (error) {
    logger.error('Error en API de eliminación de cuenta', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      );
    }

    // Obtener resumen de datos para mostrar al usuario
    const dataSummary = await getUserDataSummary(userId);

    return NextResponse.json(dataSummary);

  } catch (error) {
    logger.error('Error obteniendo resumen de datos de usuario', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de usuario' },
      { status: 500 }
    );
  }
}
