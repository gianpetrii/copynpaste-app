import { NextRequest, NextResponse } from 'next/server';
import { deleteUserAccount, getUserDataSummary } from '@/lib/firebase/account-deletion';
import { deleteUserAccountAdmin } from '@/lib/server/account-deletion-admin';
import { adminAuth } from '@/lib/firebase/admin';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, confirmationText, idToken } = body;

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

    // Validar token del usuario para operar como Admin de forma segura
    try {
      if (!idToken || !adminAuth) throw new Error('ID token requerido');
      const decoded = await adminAuth.verifyIdToken(idToken);
      if (decoded.uid !== user.uid) throw new Error('Token inválido para este usuario');
    } catch (e) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Opcional: obtener resumen (via cliente ya se muestra). Aquí lo omitimos o lo capturamos best-effort
    let dataSummary = null;
    try { dataSummary = await getUserDataSummary(user.uid); } catch {}

    // Proceder con la eliminación
    // Ejecutar eliminación con privilegios de servidor
    const deletionResult = await deleteUserAccountAdmin(user.uid);

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
