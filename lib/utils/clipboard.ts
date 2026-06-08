'use client';

import { logger } from './logger';
import { getApiUrl } from './api-url';
import { nativeShareFile } from '@/lib/native/share';

/**
 * Detecta si estamos en un dispositivo móvil
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Comparte una imagen usando la Share API (móvil)
 */
export async function shareImage(imageUrl: string, fileName: string = 'image.png'): Promise<boolean> {
  try {
    // Verificar si el navegador soporta Share API
    if (!navigator.share) {
      logger.warn('Share API no soportada');
      return false;
    }

    logger.info('Compartiendo imagen via Share API', { imageUrl, fileName });

    // Descargar la imagen primero
    let blob: Blob;
    
    try {
      const proxyUrl = getApiUrl(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }
      
      blob = await response.blob();
      
      // Inferir tipo si falta
      if (!blob.type || blob.type === 'application/octet-stream') {
        const urlLower = imageUrl.toLowerCase();
        let inferredType = 'image/png';
        
        if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) inferredType = 'image/jpeg';
        else if (urlLower.includes('.gif')) inferredType = 'image/gif';
        else if (urlLower.includes('.webp')) inferredType = 'image/webp';
        
        blob = new Blob([blob], { type: inferredType });
      }
    } catch (error) {
      logger.error('Error descargando imagen para compartir', { error });
      return false;
    }

    // Crear archivo para compartir
    const file = new File([blob], fileName, { type: blob.type });

    const nativeShared = await nativeShareFile(file, 'Compartir imagen');
    if (nativeShared) {
      logger.info('Imagen compartida via native share');
      return true;
    }

    // Verificar si puede compartir archivos via Web Share API
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      logger.warn('No se pueden compartir archivos en este navegador');
      return false;
    }

    // Compartir
    await navigator.share({
      files: [file],
      title: 'Compartir imagen',
      text: 'Imagen de CopyNPaste'
    });

    logger.info('Imagen compartida exitosamente');
    return true;

  } catch (error) {
    // Si el usuario cancela, no es un error
    if (error instanceof Error && error.name === 'AbortError') {
      logger.info('Usuario canceló compartir');
      return false;
    }
    
    logger.error('Error compartiendo imagen', { error });
    return false;
  }
}

/**
 * Fetches image blob via proxy with fallbacks.
 */
async function fetchImageBlob(imageUrl: string): Promise<Blob> {
  const inferType = (blob: Blob, url: string): Blob => {
    if (blob.type && blob.type !== 'application/octet-stream') return blob;
    const u = url.toLowerCase();
    let t = 'image/png';
    if (u.includes('.jpg') || u.includes('.jpeg')) t = 'image/jpeg';
    else if (u.includes('.gif')) t = 'image/gif';
    else if (u.includes('.webp')) t = 'image/webp';
    return new Blob([blob], { type: t });
  };

  // Método 1: proxy
  try {
    const proxyUrl = getApiUrl(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = inferType(await res.blob(), imageUrl);
      if (blob.size > 0) return blob;
    }
  } catch { /* fall through */ }

  // Método 2: fetch directo
  try {
    const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit', cache: 'force-cache' });
    if (res.ok) {
      const blob = inferType(await res.blob(), imageUrl);
      if (blob.size > 0) return blob;
    }
  } catch { /* fall through */ }

  // Método 3: canvas
  return downloadImageViaCanvas(imageUrl);
}

/**
 * Copia una imagen usando el plugin nativo @capacitor/clipboard.
 * No tiene restricciones de user gesture — llama a iOS/Android directamente.
 * Retorna false si no está en plataforma nativa.
 */
async function copyImageViaCapacitorPlugin(imageUrl: string): Promise<boolean> {
  try {
    const { isNativePlatform } = await import('@/lib/native/platform');
    if (!(await isNativePlatform())) return false;

    const { Clipboard } = await import('@capacitor/clipboard');
    const blob = await fetchImageBlob(imageUrl);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Capacitor Clipboard espera solo la parte base64, sin el prefijo data URI
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await Clipboard.write({ image: base64 });
    logger.info('Imagen copiada via Capacitor Clipboard plugin');
    return true;
  } catch (error) {
    logger.warn('Capacitor Clipboard falló', { error });
    return false;
  }
}

/**
 * Copia una imagen al portapapeles desde una URL.
 *
 * iOS / WKWebView requiere que navigator.clipboard.write() se invoque
 * sincrónicamente dentro del gesto del usuario. Si hacemos await fetch()
 * antes de llamar write(), iOS cancela el permiso.
 *
 * La solución es pasar un Promise<Blob> al constructor de ClipboardItem:
 * el browser registra el permiso en el momento de write() y resuelve
 * el blob de forma asíncrona internamente (WebKit blog, 2020).
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('API de clipboard no soportada');
    }

    const blobPromise = fetchImageBlob(imageUrl);
    const clipboardItem = new ClipboardItem({ 'image/png': blobPromise });
    await navigator.clipboard.write([clipboardItem]);

    logger.info('Imagen copiada al portapapeles exitosamente');
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
  fileType?: string,
  fileName?: string
): Promise<{ success: boolean; copiedAs: 'image' | 'text' | 'shared'; error?: string }> {
  const urlToCopy = fileUrl || content;
  
  // Si es una imagen, copiar como imagen
  if (fileUrl && isImageUrl(fileUrl, fileType)) {
    // 1. Plugin nativo de Capacitor — sin restricciones de user gesture, más confiable en iOS/Android
    const nativeSuccess = await copyImageViaCapacitorPlugin(fileUrl);
    if (nativeSuccess) return { success: true, copiedAs: 'image' };

    // 2. Web ClipboardItem con Promise — funciona en iOS 16+ WKWebView y desktop moderno
    if (navigator.clipboard && window.ClipboardItem) {
      logger.info('Intentando copia directa al portapapeles (ClipboardItem)');
      const webSuccess = await copyImageToClipboard(fileUrl);
      if (webSuccess) return { success: true, copiedAs: 'image' };
      logger.warn('Clipboard directo falló, intentando Share API');
    }

    // 3. Fallback: Share API (móvil)
    if (isMobileDevice()) {
      const shareSuccess = await shareImage(fileUrl, fileName || 'image.png');
      if (shareSuccess) return { success: true, copiedAs: 'shared' };
      return { 
        success: false, 
        copiedAs: 'image', 
        error: 'No se pudo copiar la imagen. Mantén presionado el thumbnail para descargarla.' 
      };
    }
    
    return { 
      success: false, 
      copiedAs: 'image', 
      error: 'No se pudo copiar la imagen. Haz clic derecho → "Copiar imagen" o descárgala.' 
    };
  }
  
  // Para todo lo demás, copiar como texto
  const textSuccess = await copyTextToClipboard(content || fileUrl || '');
  return { success: textSuccess, copiedAs: 'text' };
}
