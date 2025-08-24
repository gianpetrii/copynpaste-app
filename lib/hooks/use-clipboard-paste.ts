'use client';

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

export interface ClipboardImageData {
  file: File;
  dataUrl: string;
  type: string;
  size: number;
  name: string;
}

interface UseClipboardPasteOptions {
  onImagePaste?: (imageData: ClipboardImageData) => void;
  onTextPaste?: (text: string) => void;
  acceptedImageTypes?: string[];
  maxSize?: number; // en bytes
  enabled?: boolean;
}

export function useClipboardPaste({
  onImagePaste,
  onTextPaste,
  acceptedImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  enabled = true
}: UseClipboardPasteOptions = {}) {
  const pasteHandlerRef = useRef<((e: ClipboardEvent) => void) | null>(null);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!enabled) return;

    try {
      const items = e.clipboardData?.items;
      if (!items) return;

      // Buscar imágenes primero
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
          // Verificar si el tipo de imagen es aceptado
          if (!acceptedImageTypes.includes(item.type)) {
            logger.warn('Tipo de imagen no soportado en clipboard', { 
              type: item.type,
              acceptedTypes: acceptedImageTypes 
            });
            continue;
          }

          const file = item.getAsFile();
          if (!file) continue;

          // Verificar tamaño
          if (file.size > maxSize) {
            logger.warn('Imagen demasiado grande en clipboard', { 
              size: file.size,
              maxSize,
              fileName: file.name 
            });
            continue;
          }

          // Crear un nombre descriptivo para la imagen
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
          const extension = item.type.split('/')[1] || 'png';
          const fileName = `clipboard-image-${timestamp}.${extension}`;

          // Crear URL de datos para vista previa
          const dataUrl = await createImageDataUrl(file);

          const imageData: ClipboardImageData = {
            file: new File([file], fileName, { type: item.type }),
            dataUrl,
            type: item.type,
            size: file.size,
            name: fileName
          };

          logger.info('Imagen detectada en clipboard', {
            type: item.type,
            size: file.size,
            fileName
          });

          onImagePaste?.(imageData);
          e.preventDefault(); // Prevenir comportamiento por defecto
          return; // Solo procesar la primera imagen válida
        }
      }

      // Si no hay imágenes, buscar texto
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type === 'text/plain') {
          item.getAsString((text) => {
            if (text.trim()) {
              onTextPaste?.(text);
            }
          });
          return;
        }
      }

    } catch (error) {
      logger.error('Error procesando paste del clipboard', error);
    }
  }, [onImagePaste, onTextPaste, acceptedImageTypes, maxSize, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Actualizar la referencia del handler
    pasteHandlerRef.current = handlePaste;

    // Wrapper que usa la referencia actual
    const pasteWrapper = (e: ClipboardEvent) => {
      pasteHandlerRef.current?.(e);
    };

    document.addEventListener('paste', pasteWrapper);

    return () => {
      document.removeEventListener('paste', pasteWrapper);
    };
  }, [handlePaste, enabled]);

  return {
    isEnabled: enabled
  };
}

// Función auxiliar para crear data URL de imagen
async function createImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

// Hook simplificado solo para imágenes
export function useClipboardImagePaste(
  onImagePaste: (imageData: ClipboardImageData) => void,
  options?: Omit<UseClipboardPasteOptions, 'onImagePaste'>
) {
  return useClipboardPaste({
    ...options,
    onImagePaste
  });
}
