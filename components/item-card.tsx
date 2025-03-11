"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { useItems } from "@/lib/hooks"
import type { Item } from "@/types"
import { FileText, Image, LinkIcon, Trash, Edit, Copy, Download, Star, MoreHorizontal } from "lucide-react"

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
      await navigator.clipboard.writeText(item.content || item.fileUrl || "")
      toast({
        title: "Copiado al portapapeles",
        description: "El contenido ha sido copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles",
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
        return <FileText className="h-5 w-5 dark:text-white" />
      case "file":
        if (item.fileType?.startsWith("image/")) {
          return <Image className="h-5 w-5 dark:text-white" />
        }
        return <FileText className="h-5 w-5 dark:text-white" />
      case "url":
        return <LinkIcon className="h-5 w-5 dark:text-white" />
      default:
        return <FileText className="h-5 w-5 dark:text-white" />
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

  const renderContent = () => {
    if (isEditing) {
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) {
          e.preventDefault();
          handleUpdate();
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

    if (item.type === "file" && item.fileType?.startsWith("image/") && item.fileUrl) {
      return (
        <div className="mt-2">
          <img
            src={item.fileUrl || "/placeholder.svg"}
            alt={item.fileName || "Imagen"}
            className="max-h-40 rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-sm text-muted-foreground mt-1 break-words">{item.fileName}</p>
        </div>
      )
    }

    const truncatedContent = truncateText(item.content);
    const showButton = shouldShowExpandButton(item.content);
    
    return (
      <div>
        <p className={`text-foreground break-words whitespace-pre-wrap ${!showFullText ? 'inline' : ''}`}>
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
        </p>
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

  return (
    <div 
      className="border border-border rounded-md p-3 sm:p-4 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={handleCopy}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="text-primary">{renderIcon()}</div>
              {isMobile && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMobileActions}
                  className="text-muted-foreground hover:bg-secondary hover:text-foreground ml-auto"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Desktop actions */}
            {!isMobile && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleFavorite}
                  className={`${isFavorite ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'} hover:bg-secondary`}
                >
                  <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                  <span className="sr-only">{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                </Button>
                {!isEditing && item.type !== "file" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleEdit}
                    className="text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copiar</span>
                </Button>
                {item.type === "file" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDownload}
                    className="text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Descargar</span>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-1">
            {renderContent()}
            <div className="text-xs text-muted-foreground mt-2">
              Creado: {formatDate(item.createdAt)}
              {item.updatedAt && (
                typeof item.updatedAt === 'object' && item.updatedAt instanceof Date && 
                typeof item.createdAt === 'object' && item.createdAt instanceof Date && 
                item.updatedAt.getTime() !== item.createdAt.getTime() ? (
                  <> • Modificado: {formatDate(item.updatedAt)}</>
                ) : (
                  item.updatedAt !== item.createdAt && <> • Modificado: {formatDate(item.updatedAt)}</>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile actions - horizontal row at the bottom */}
      {isMobile && showMobileActions && (
        <div className="flex justify-between mt-3 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            className={`${isFavorite ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'} hover:bg-secondary`}
          >
            <Star className="h-4 w-4 mr-1" fill={isFavorite ? "currentColor" : "none"} />
            <span className="text-xs">{isFavorite ? "Quitar" : "Favorito"}</span>
          </Button>
          
          {!isEditing && item.type !== "file" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="text-xs">Editar</span>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => handleCopy(e)}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Copy className="h-4 w-4 mr-1" />
            <span className="text-xs">Copiar</span>
          </Button>
          
          {item.type === "file" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="text-xs">Descargar</span>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash className="h-4 w-4 mr-1" />
            <span className="text-xs">Eliminar</span>
          </Button>
        </div>
      )}
    </div>
  )
}

