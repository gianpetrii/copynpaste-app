import { NextRequest } from 'next/server';
import { corsBlobResponse, corsJsonResponse, corsOptionsResponse } from '@/lib/utils/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return corsJsonResponse({ error: 'URL parameter is required' }, request, { status: 400 });
    }

    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
      return corsJsonResponse(
        { error: 'Only Firebase Storage URLs are allowed' },
        request,
        { status: 403 }
      );
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'CopyNPaste-App/1.0',
      },
    });

    if (!response.ok) {
      return corsJsonResponse(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        request,
        { status: response.status }
      );
    }

    const blob = await response.blob();

    let contentType = blob.type;
    if (!contentType || contentType === 'application/octet-stream') {
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.png')) contentType = 'image/png';
      else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) contentType = 'image/jpeg';
      else if (urlLower.includes('.gif')) contentType = 'image/gif';
      else if (urlLower.includes('.webp')) contentType = 'image/webp';
      else if (urlLower.includes('.svg')) contentType = 'image/svg+xml';
      else contentType = 'image/png';
    }

    return corsBlobResponse(blob, request, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
    });
  } catch (error) {
    return corsJsonResponse(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      request,
      { status: 500 }
    );
  }
}
