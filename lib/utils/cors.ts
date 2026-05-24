import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:3000',
  'https://copynpaste-app-d4159.web.app',
  'https://copynpaste.app',
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.startsWith(allowed))
      ? origin
      : ALLOWED_ORIGINS[2];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function corsJsonResponse(
  data: unknown,
  request: Request,
  init?: ResponseInit
): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

export function corsOptionsResponse(request: Request): NextResponse {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export function corsBlobResponse(
  blob: Blob,
  request: Request,
  headers: Record<string, string> = {}
): NextResponse {
  const origin = request.headers.get('origin');
  return new NextResponse(blob, {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      ...headers,
    },
  });
}
