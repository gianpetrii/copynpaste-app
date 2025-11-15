"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/use-toast"
import { formatDate } from "@/lib/utils"
import { useItems } from "@/lib/hooks"
import type { Item } from "@/types"
import { 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash, 
  Edit, 
  Copy, 
  Download, 
  Star, 
  MoreHorizontal,
  FileCode,
  AudioLines as FileAudio,
  Video as FileVideo,
  FileText as FilePdf,
  Archive as FileArchive,
  File
} from "lucide-react"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const { toast } = useToast()
  const { updateItem, deleteItem } = useItems(item.userId)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(item.favorite || false)
  const [showFullText, setShowFullText] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileActions, setShowMobileActions] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleCopy = async (e?: React.MouseEvent) => {
    // If the event comes from a button click, stop propagation
    if (e && e.currentTarget !== e.target) {
      e.stopPropagation();
    }
    
    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { copyItemContent } = await import('@/lib/utils/clipboard');
      
      const result = await copyItemContent(
        item.content || "",
        item.fileUrl,
        item.fileType
      );
      
      if (result.success) {
        const description = result.copiedAs === 'image' 
          ? "🖼️ La imagen ha sido copiada. Puedes pegarla en otras aplicaciones (Discord, WhatsApp, Paint, etc.)"
          : "El contenido ha sido copiado al portapapeles";
          
        toast({
          title: "✅ Copiado al portapapeles",
          description,
        })
      } else {
        // Para imágenes, mostrar opciones alternativas
        if (item.type === 'file' && item.fileUrl) {
          toast({
            title: "⚠️ Copiar imagen (limitación técnica)",
            description: "Por limitaciones de CORS, abre la imagen en nueva ventana y haz clic derecho → 'Copiar imagen'",
            variant: "default",
            action: (
              <button
                onClick={() => window.open(item.fileUrl, '_blank')}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-primary text-primary-foreground px-3 text-sm font-medium transition-colors hover:bg-primary/90"
              >
                Abrir imagen
              </button>
            ),
          })
        } else {
          // Error genérico para otros tipos
          const errorMessage = result.error || "No se pudo copiar al portapapeles";
          toast({
            title: "❌ Error al copiar",
            description: errorMessage,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "❌ Error inesperado",
        description: "Hubo un problema al intentar copiar. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent copying when clicking delete
    try {
      setIsLoading(true)
      await deleteItem(item.id)
      toast({
        title: "Elemento eliminado",
        description: "El elemento ha sido eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "Ha ocurrido un error al eliminar el elemento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      await updateItem(item.id, { content: editedContent })
      setIsEditing(false)
      toast({
        title: "Elemento actualizado",
        description: "El elemento ha sido actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "Ha ocurrido un error al actualizar el elemento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent copying when clicking favorite
    try {
      setIsLoading(true)
      const newFavoriteStatus = !isFavorite
      await updateItem(item.id, { favorite: newFavoriteStatus })
      setIsFavorite(newFavoriteStatus)
      toast({
        title: newFavoriteStatus ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: newFavoriteStatus 
          ? "El elemento ha sido añadido a favoritos" 
          : "El elemento ha sido eliminado de favoritos",
      })
    } catch (error) {
      toast({
        title: "Error al actualizar favoritos",
        description: "Ha ocurrido un error al actualizar el estado de favoritos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent copying when clicking download
    if (item.fileUrl) {
      window.open(item.fileUrl, "_blank")
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent copying when clicking edit
    setIsEditing(true);
  }

  const toggleMobileActions = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent copying when toggling actions
    setShowMobileActions(!showMobileActions);
  }

  const renderIcon = () => {
    switch (item.type) {
      case "text":
        return <FileText className="h-3 w-3 dark:text-white" />
      case "file":
        // No mostrar icono para archivos, ya que se muestra uno más grande en el contenido
        return null;
      case "url":
        return <LinkIcon className="h-3 w-3 dark:text-white" />
      default:
        return <FileText className="h-3 w-3 dark:text-white" />
    }
  }

  // Function to truncate text based on device size and line count
  const truncateText = (text: string) => {
    if (!text) return "";
    
    // For explicit truncation (when CSS line-clamp might not be fully supported)
    // Count number of lines (by counting newline characters)
    const lineCount = (text.match(/\n/g) || []).length + 1;
    
    if (isMobile) {
      // For mobile: limit to 50 characters or 2 lines
      const exceedsLineLimit = lineCount > 2;
      const exceedsCharLimit = text.length > 50;
      
      if ((exceedsLineLimit || exceedsCharLimit) && !showFullText) {
        if (exceedsLineLimit) {
          // Find the position of the second newline character
          let pos = text.indexOf('\n');
          if (pos !== -1) {
            pos = text.indexOf('\n', pos + 1);
            if (pos !== -1) {
              return text.substring(0, pos) + "...";
            }
          }
        }
        
        // If we didn't truncate by lines or there aren't enough newlines,
        // truncate by character count
        if (text.length > 50) {
          return text.substring(0, 50) + "...";
        }
      }
    } else {
      // For desktop: limit to 300 characters or 3 lines
      const exceedsLineLimit = lineCount > 3;
      const exceedsCharLimit = text.length > 300;
      
      if ((exceedsLineLimit || exceedsCharLimit) && !showFullText) {
        if (exceedsLineLimit) {
          // Find the position of the third newline character
          let pos = text.indexOf('\n');
          if (pos !== -1) {
            pos = text.indexOf('\n', pos + 1);
            if (pos !== -1) {
              pos = text.indexOf('\n', pos + 1);
              if (pos !== -1) {
                return text.substring(0, pos) + "...";
              }
            }
          }
        }
        
        // If we didn't truncate by lines or there aren't enough newlines,
        // truncate by character count
        if (text.length > 300) {
          return text.substring(0, 300) + "...";
        }
      }
    }
    return text;
  };

  const shouldShowExpandButton = (content: string) => {
    if (!content) return false;
    
    const lineCount = (content.match(/\n/g) || []).length + 1;
    
    if (isMobile) {
      return lineCount > 2 || content.length > 50;
    } else {
      return lineCount > 3 || content.length > 300;
    }
  };

  // Helper function to detect if a file is an image
  const isImageFile = () => {
    // Method 1: Check fileType
    if (item.fileType?.startsWith("image/")) {
      return true;
    }
    
    // Method 2: Check file extension if fileType is missing
    if (item.fileName) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico'];
      const lowerFileName = item.fileName.toLowerCase();
      return imageExtensions.some(ext => lowerFileName.endsWith(ext));
    }
    
    // Method 3: Check if URL contains image indicators
    if (item.fileUrl) {
      const lowerUrl = item.fileUrl.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?|$)/i.test(lowerUrl);
    }
    
    return false;
  };

  const renderContent = () => {
    // Debug: Log file type for images to help troubleshoot
    if (item.type === "file" && isImageFile()) {
      console.log("🖼️ Image item:", {
        fileName: item.fileName,
        fileType: item.fileType,
        hasUrl: !!item.fileUrl,
        detectionMethod: item.fileType ? 'fileType' : 'extension/url'
      });
    }

    if (isEditing) {
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
          if (e.altKey) {
            // Alt+Enter: nueva línea (comportamiento por defecto)
            return;
          } else {
            // Enter solo: guardar cambios
          e.preventDefault();
          handleUpdate();
          }
        }
      };
      
      return (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2 bg-background border-border text-foreground"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdate} disabled={isLoading}>
              Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
                setEditedContent(item.content || "");
              }}
              disabled={isLoading}
              className="dark:text-white dark:border-white/30"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )
    }

    if (item.type === "url") {
      const truncatedContent = truncateText(item.content);
      const showButton = shouldShowExpandButton(item.content);
      
      return (
        <div>
          <a
            href={item.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-blue-600 hover:underline dark:text-blue-400 break-words ${!showFullText ? 'inline' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {showFullText ? item.content : truncatedContent}
            {showButton && !showFullText && (
              <span className="text-xs text-primary ml-1 inline-flex items-center">
                (<button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullText(true);
                  }}
                  className="text-primary underline inline"
                >
                  ver más
                </button>)
              </span>
            )}
          </a>
          {showButton && showFullText && (
            <span className="text-xs text-primary ml-1 inline-flex items-center">
              (<button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullText(false);
                }}
                className="text-primary underline inline"
              >
                ver menos
              </button>)
            </span>
          )}
        </div>
      )
    }

    if (item.type === "file" && isImageFile() && item.fileUrl) {
      return (
        <div className="mt-2">
          <img
            src={item.fileUrl || "/placeholder.svg"}
            alt={item.fileName || "Imagen"}
            className="max-h-40 rounded-md object-contain bg-secondary/30"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              // Fallback si la imagen no carga
              console.error("Error loading image:", item.fileName);
              e.currentTarget.style.display = 'none';
            }}
          />
          <p className="text-sm text-muted-foreground mt-1 break-words">
            {item.fileName}
            <span className="text-xs ml-2 text-muted-foreground/70">
              ({item.fileType || 'imagen'})
            </span>
          </p>
        </div>
      )
    }

    if (item.type === "file" && item.fileUrl) {
      // Determinar el icono adecuado según el tipo de archivo
      const getFileIcon = () => {
        if (!item.fileType) return <File className="h-5 w-5 mr-2 text-primary" />;
        
        const fileType = item.fileType.toLowerCase();
        
        if (fileType.startsWith('image/')) {
          return <ImageIcon className="h-5 w-5 mr-2 text-primary" />;
        } else if (fileType.startsWith('audio/')) {
          return <FileAudio className="h-5 w-5 mr-2 text-primary" />;
        } else if (fileType.startsWith('video/')) {
          return <FileVideo className="h-5 w-5 mr-2 text-primary" />;
        } else if (fileType === 'application/pdf') {
          return <FilePdf className="h-5 w-5 mr-2 text-primary" />;
        } else if (fileType.includes('zip') || fileType.includes('compressed') || fileType.includes('archive')) {
          return <FileArchive className="h-5 w-5 mr-2 text-primary" />;
        } else if (fileType.includes('javascript') || fileType.includes('json') || fileType.includes('html') || 
                  fileType.includes('css') || fileType.includes('xml') || fileType.includes('text/plain')) {
          return <FileCode className="h-5 w-5 mr-2 text-primary" />;
        } else {
          return <File className="h-5 w-5 mr-2 text-primary" />;
        }
      };
      
      // Obtener una descripción amigable del tipo de archivo
      const getFileTypeDescription = () => {
        if (!item.fileType) return "";
        
        const fileType = item.fileType.toLowerCase();
        
        if (fileType.startsWith('image/')) {
          return `Imagen ${fileType.split('/')[1]?.toUpperCase() || ''}`;
        } else if (fileType.startsWith('audio/')) {
          return `Audio ${fileType.split('/')[1]?.toUpperCase() || ''}`;
        } else if (fileType.startsWith('video/')) {
          return `Video ${fileType.split('/')[1]?.toUpperCase() || ''}`;
        } else if (fileType === 'application/pdf') {
          return 'Documento PDF';
        } else if (fileType.includes('zip') || fileType.includes('compressed') || fileType.includes('archive')) {
          return 'Archivo comprimido';
        } else if (fileType.includes('javascript')) {
          return 'Código JavaScript';
        } else if (fileType.includes('json')) {
          return 'Archivo JSON';
        } else if (fileType.includes('html')) {
          return 'Documento HTML';
        } else if (fileType.includes('css')) {
          return 'Hoja de estilos CSS';
        } else if (fileType.includes('text/plain')) {
          return 'Archivo de texto';
        } else {
          return fileType.split('/')[1]?.toUpperCase() || fileType;
        }
      };
      
      return (
        <div className="mt-1">
          <div className="flex items-center">
            {getFileIcon()}
            <div>
              <p className="text-sm lg:text-base font-medium break-words">{item.fileName}</p>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
                {item.fileType ? ` • ${getFileTypeDescription()}` : ""}
              </p>
            </div>
          </div>
        </div>
      )
    }

    const truncatedContent = truncateText(item.content);
    const showButton = shouldShowExpandButton(item.content);
    
    return (
      <div>
        <p className={`text-sm lg:text-base text-foreground break-words whitespace-pre-wrap ${!showFullText ? 'inline' : ''}`}>
          {showFullText ? item.content : truncatedContent}
          {showButton && !showFullText && (
            <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
              (<button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullText(true);
                }}
                className="text-primary underline inline"
              >
                ver más
              </button>)
            </span>
          )}
        </p>
        {showButton && showFullText && (
          <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
            (<button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFullText(false);
              }}
              className="text-primary underline inline"
            >
              ver menos
            </button>)
          </span>
        )}
      </div>
    )
  }

  return (
    <div 
      className="item-card border border-border rounded-md p-2 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={handleCopy}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              {renderIcon() && <div className="text-primary">{renderIcon()}</div>}
              {isMobile && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMobileActions}
                  className="text-muted-foreground ml-auto h-6 w-6"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Desktop actions */}
            {!isMobile && (
              <div className="flex gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleFavorite}
                  className={`h-6 w-6 ${isFavorite ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'}`}
                >
                  <Star className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
                  <span className="sr-only">{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                </Button>
                {!isEditing && item.type !== "file" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEdit}
                    className="text-muted-foreground h-6 w-6"
                  >
                    <Edit className="h-3 w-3" />
                    <span className="sr-only">Editar</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-muted-foreground h-6 w-6"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copiar</span>
                </Button>
                {item.type === "file" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDownload}
                    className="text-muted-foreground h-6 w-6"
                  >
                    <Download className="h-3 w-3" />
                    <span className="sr-only">Descargar</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-500 hover:bg-destructive hover:text-white transition-colors h-6 w-6"
                >
                  <Trash className="h-3 w-3" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-0.5">
            {renderContent()}
            <div className="text-xs lg:text-sm text-muted-foreground mt-1">
              {formatDate(item.createdAt)}
              {item.updatedAt && (
                typeof item.updatedAt === 'object' && item.updatedAt instanceof Date && 
                typeof item.createdAt === 'object' && item.createdAt instanceof Date && 
                item.updatedAt.getTime() !== item.createdAt.getTime() ? (
                  <> • {formatDate(item.updatedAt)}</>
                ) : (
                  item.updatedAt !== item.createdAt && <> • {formatDate(item.updatedAt)}</>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile actions - horizontal row at the bottom */}
      {isMobile && showMobileActions && (
        <div className="flex justify-between mt-2 pt-1.5 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            className={`h-7 ${isFavorite ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'}`}
          >
            <Star className="h-3 w-3 mr-1" fill={isFavorite ? "currentColor" : "none"} />
                                <span className="text-sm lg:text-base">{isFavorite ? "Quitar" : "Favorito"}</span>
          </Button>
          
          {!isEditing && item.type !== "file" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="text-muted-foreground h-7"
            >
              <Edit className="h-3 w-3 mr-1" />
              <span className="text-sm lg:text-base">Editar</span>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleCopy(e)}
            className="text-muted-foreground h-7"
          >
            <Copy className="h-3 w-3 mr-1" />
                          <span className="text-sm lg:text-base">Copiar</span>
          </Button>
          
          {item.type === "file" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="text-muted-foreground h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="text-sm lg:text-base">Descargar</span>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-500 hover:bg-destructive hover:text-white transition-colors h-7"
          >
            <Trash className="h-3 w-3 mr-1" />
                          <span className="text-sm lg:text-base">Eliminar</span>
          </Button>
        </div>
      )}
    </div>
  )
}

