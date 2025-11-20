import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    console.log('🔍 Proxy request received:', {
      url: imageUrl,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    if (!imageUrl) {
      console.error('❌ No URL parameter provided');
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Verificar que la URL sea de Firebase Storage (seguridad)
    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
      console.error('❌ Invalid URL domain:', imageUrl);
      return NextResponse.json(
        { error: 'Only Firebase Storage URLs are allowed' },
        { status: 403 }
      );
    }

    console.log('✅ URL validation passed, fetching image...');

    // Descargar la imagen con headers apropiados
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'CopyNPaste-App/1.0',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image ${imageUrl}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    
    console.log(`Successfully fetched image: ${blob.size} bytes, type: ${blob.type}`);
    
    // Verificar que sea una imagen
    if (!blob.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image' },
        { status: 400 }
      );
    }

    // Retornar la imagen con headers CORS apropiados
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': blob.type,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      },
    });

  } catch (error) {
    console.error('Error in image proxy:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Permitir CORS para OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
