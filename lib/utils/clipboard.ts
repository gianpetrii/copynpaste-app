'use client';

import { logger } from './logger';

/**
 * Copia una imagen al portapapeles desde una URL
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    // Verificar si el navegador soporta la API de clipboard para imágenes
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('API de clipboard no soportada');
    }

    let blob: Blob;

    try {
      // Método 1: Usar proxy (funciona tanto en desarrollo como producción)
      logger.info('Descargando imagen via proxy', { imageUrl });
      
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        logger.warn('Proxy falló', { 
          status: proxyResponse.status, 
          statusText: proxyResponse.statusText,
          errorText 
        });
        throw new Error(`Proxy error: ${proxyResponse.status}`);
      }
      
      blob = await proxyResponse.blob();
      logger.info('Imagen descargada via proxy exitosamente', { 
        size: blob.size, 
        type: blob.type 
      });
      
    } catch (proxyError) {
      logger.warn('Proxy falló, intentando fetch directo', { 
        error: proxyError,
        errorMessage: proxyError instanceof Error ? proxyError.message : 'Unknown error'
      });
      
      try {
        // Método 2: Fetch directo como fallback
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        blob = await response.blob();
        logger.info('Imagen descargada via fetch directo');
        
      } catch (directError) {
        logger.warn('Fetch directo falló, intentando canvas', { error: directError });
        // Método 3: Canvas como último recurso
        blob = await downloadImageViaCanvas(imageUrl);
        logger.info('Imagen descargada via canvas');
      }
    }
    
    // Verificar que sea una imagen
    if (!blob.type.startsWith('image/')) {
      throw new Error('El archivo no es una imagen válida');
    }

    // Crear ClipboardItem con la imagen
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob
    });

    // Copiar al portapapeles
    await navigator.clipboard.write([clipboardItem]);
    
    logger.info('Imagen copiada al portapapeles exitosamente', {
      imageUrl,
      type: blob.type,
      size: blob.size
    });

    return true;
  } catch (error) {
    logger.error('Error copiando imagen al portapapeles', { error });
    return false;
  }
}

/**
 * Descarga imagen usando canvas para evitar CORS (método legacy)
 */
async function downloadImageViaCanvas(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Intentar sin crossOrigin primero
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('No se pudo crear contexto de canvas');
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            logger.info('Canvas method successful', { size: blob.size });
            resolve(blob);
          } else {
            reject(new Error('No se pudo crear blob desde canvas'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      logger.warn('Canvas method failed', { error, imageUrl });
      reject(new Error('Error cargando imagen para canvas - CORS bloqueado'));
    };
    
    // Intentar cargar la imagen (esto probablemente falle por CORS también)
    img.src = imageUrl;
    
    // Timeout después de 10 segundos
    setTimeout(() => {
      reject(new Error('Timeout cargando imagen'));
    }, 10000);
  });
}

/**
 * Copia texto al portapapeles (fallback)
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    // Asegurar que el documento esté enfocado
    if (document.visibilityState === 'visible') {
      window.focus();
    }
    
    // Intentar API moderna primero
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      logger.info('Texto copiado al portapapeles (API moderna)', { textLength: text.length });
      return true;
    }
    
    // Fallback: método legacy
    return copyTextLegacy(text);
  } catch (error) {
    logger.warn('Error con API moderna, intentando método legacy', { error });
    // Intentar método legacy como fallback
    return copyTextLegacy(text);
  }
}

/**
 * Método legacy para copiar texto
 */
function copyTextLegacy(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      logger.info('Texto copiado al portapapeles (método legacy)', { textLength: text.length });
      return true;
    } else {
      throw new Error('execCommand failed');
    }
  } catch (error) {
    logger.error('Error copiando texto con método legacy', { error });
    return false;
  }
}

/**
 * Determina si una URL es una imagen
 */
export function isImageUrl(url: string, fileType?: string): boolean {
  if (fileType) {
    return fileType.startsWith('image/');
  }
  
  // Verificar por extensión de archivo
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const urlLower = url.toLowerCase();
  
  return imageExtensions.some(ext => urlLower.includes(ext));
}

/**
 * Función principal para copiar contenido inteligentemente
 */
export async function copyItemContent(
  content: string,
  fileUrl?: string,
  fileType?: string
): Promise<{ success: boolean; copiedAs: 'image' | 'text'; error?: string }> {
  const urlToCopy = fileUrl || content;
  
  // Si es una imagen, FORZAR que se copie como imagen
  if (fileUrl && isImageUrl(fileUrl, fileType)) {
    // Verificar compatibilidad del navegador
    if (!navigator.clipboard || !window.ClipboardItem) {
      return { 
        success: false, 
        copiedAs: 'text', 
        error: 'Tu navegador no soporta copiar imágenes. Actualiza a una versión más reciente.' 
      };
    }
    
    // Intentar copiar como imagen con múltiples métodos
    const imageSuccess = await copyImageToClipboard(fileUrl);
    if (imageSuccess) {
      return { success: true, copiedAs: 'image' };
    }
    
    // Si falla, mostrar instrucciones específicas para el usuario
    return { 
      success: false, 
      copiedAs: 'image', 
      error: '🔧 No se pudo copiar la imagen directamente. Puedes:\n1. Hacer clic derecho → "Copiar imagen" en el navegador\n2. O descargar la imagen y copiarla manualmente' 
    };
  }
  
  // Para todo lo demás, copiar como texto
  const textSuccess = await copyTextToClipboard(content || fileUrl || '');
  return { success: textSuccess, copiedAs: 'text' };
}
