import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth) {
      return corsJsonResponse({ error: 'Servicio no disponible' }, request, { status: 503 });
    }

    const body = await request.json();
    const { idToken } = body as { idToken?: string };

    if (!idToken) {
      return corsJsonResponse({ error: 'Token requerido' }, request, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const customToken = await adminAuth.createCustomToken(decoded.uid);

    return corsJsonResponse({ customToken }, request);
  } catch {
    return corsJsonResponse({ error: 'No autorizado' }, request, { status: 401 });
  }
}
