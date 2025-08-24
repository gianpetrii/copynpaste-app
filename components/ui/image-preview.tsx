'use client';

import { useState } from 'react';
import { X, Upload, Eye, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatFileSize } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
  size?: number;
  type?: string;
  fileName?: string;
  onRemove?: () => void;
  onUpload?: () => void;
  uploading?: boolean;
  className?: string;
}

export function ImagePreview({
  src,
  alt,
  size,
  type,
  fileName,
  onRemove,
  onUpload,
  uploading = false,
  className = ""
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (imageError) {
    return (
      <Card className={`relative ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <FileImage className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {fileName || 'Imagen'}
              </p>
              <p className="text-xs text-muted-foreground">
                Error al cargar imagen
              </p>
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-blue-300 dark:border-slate-600 p-4 ${className}`}>
        {/* Header con icono y título */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileImage className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Imagen del portapapeles
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lista para guardar
              </p>
            </div>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>

        {/* Vista previa de la imagen - más compacta y elegante */}
        <div className="relative mb-4">
          <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm">
            <img
              src={src}
              alt={alt}
              className="w-full h-24 sm:h-32 object-cover cursor-pointer transition-transform hover:scale-105"
              onError={() => setImageError(true)}
              onClick={() => setIsExpanded(true)}
            />
            
            {/* Overlay sutil al hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Información de la imagen - más compacta */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">
              {fileName || 'Imagen pegada'}
            </span>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>{type?.split('/')[1]?.toUpperCase()}</span>
              {size && <span>{formatFileSize(size)}</span>}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="sm"
              className="flex-1 h-8"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            {onUpload && (
              <Button
                onClick={onUpload}
                disabled={uploading}
                className="flex-2 h-8 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Guardar imagen
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para vista expandida */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Función helper para formatear tamaño de archivo (si no existe)
declare global {
  namespace NodeJS {
    interface Global {
      formatFileSize?: (bytes: number) => string;
    }
  }
}
