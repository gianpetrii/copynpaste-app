"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/use-toast"
import { useItems } from "@/lib/hooks"
import { useSwipe } from "@/lib/hooks/use-swipe"
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
  FileCode,
  AudioLines as FileAudio,
  Video as FileVideo,
  FileText as FilePdf,
  Archive as FileArchive,
  File,
  Link2
} from "lucide-react"

interface ItemCardProps {
  item: Item
}

const LONG_PRESS_DURATION = 550

export function ItemCard({ item }: ItemCardProps) {
  const { toast } = useToast()
  const { updateItem, deleteItem } = useItems(item.userId)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(item.favorite || false)
  const [showFullText, setShowFullText] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)
  const touchStartXRef = useRef(0)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e && e.currentTarget !== e.target) e.stopPropagation()
    try {
      const { copyItemContent } = await import('@/lib/utils/clipboard')
      const result = await copyItemContent(
        item.content || "",
        item.fileUrl,
        item.fileType,
        item.fileName
      )
      if (result.success) {
        const { triggerHaptic } = await import('@/lib/native/haptics')
        await triggerHaptic(result.copiedAs === 'shared' ? 'success' : 'light')
        let description = "El contenido ha sido copiado al portapapeles"
        if (result.copiedAs === 'image') {
          description = "🖼️ La imagen ha sido copiada. Puedes pegarla en otras aplicaciones"
        } else if (result.copiedAs === 'shared') {
          description = "📤 Menú de compartir abierto. Selecciona 'Copiar' para copiar al portapapeles"
        }
        toast({
          title: result.copiedAs === 'shared' ? "📤 Compartir imagen" : "✅ Copiado al portapapeles",
          description,
        })
      } else {
        if (item.type === 'file' && item.fileUrl) {
          toast({
            title: "⚠️ Copiar imagen",
            description: "Por limitaciones de CORS, abre la imagen en nueva ventana y haz clic derecho → 'Copiar imagen'",
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
          toast({
            title: "❌ Error al copiar",
            description: result.error || "No se pudo copiar al portapapeles",
            variant: "destructive",
          })
        }
      }
    } catch {
      toast({ title: "❌ Error inesperado", description: "Intenta nuevamente.", variant: "destructive" })
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsLoading(true)
      await deleteItem(item.id)
      toast({ title: "Elemento eliminado", description: "El elemento ha sido eliminado correctamente" })
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      await updateItem(item.id, { content: editedContent })
      setIsEditing(false)
      toast({ title: "Elemento actualizado" })
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsLoading(true)
      const newFav = !isFavorite
      await updateItem(item.id, { favorite: newFav })
      setIsFavorite(newFav)
      toast({ title: newFav ? "Añadido a favoritos" : "Eliminado de favoritos" })
    } catch {
      toast({ title: "Error al actualizar favoritos", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (item.fileUrl) window.open(item.fileUrl, "_blank")
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const text = item.fileUrl || item.content
      if (text) {
        await navigator.clipboard.writeText(text)
        toast({ title: "🔗 Enlace copiado" })
      }
    } catch {
      toast({ title: "Error al copiar", variant: "destructive" })
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  // ─── Long press ──────────────────────────────────────────────────────────────

  const handleLongPress = useCallback(() => {
    longPressTriggeredRef.current = true
    import('@/lib/native/haptics').then(({ triggerHaptic }) => triggerHaptic('medium'))
    if (item.type === 'text' || item.type === 'url') {
      setIsEditing(true)
    } else if (item.fileUrl) {
      handleDownload()
    }
  }, [item.type, item.fileUrl])

  // ─── Swipe ───────────────────────────────────────────────────────────────────

  const handleSwipeLeft = async () => {
    if (!isMobile) return
    try {
      setIsLoading(true)
      await deleteItem(item.id)
      toast({ title: "✅ Elemento eliminado" })
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipeRight = async () => {
    if (!isMobile) return
    try {
      const newFav = !isFavorite
      await updateItem(item.id, { favorite: newFav })
      setIsFavorite(newFav)
      toast({
        title: newFav ? "⭐ Añadido a favoritos" : "Favorito eliminado",
        duration: 2000,
      })
    } catch {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 80,
    maxSwipeTime: 500,
  })

  // Combined touch handlers: long press + swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress()
    }, LONG_PRESS_DURATION)
    swipeHandlers.onTouchStart(e)
  }, [swipeHandlers.onTouchStart, handleLongPress])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current)
    if (deltaX > 8 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    swipeHandlers.onTouchMove(e)
  }, [swipeHandlers.onTouchMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    swipeHandlers.onTouchEnd()
  }, [swipeHandlers.onTouchEnd])

  // ─── Card click ──────────────────────────────────────────────────────────────

  const handleCardClick = (e: React.MouseEvent) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }
    handleCopy(e)
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const renderIcon = () => {
    switch (item.type) {
      case "text": return <FileText className="h-3 w-3 dark:text-white" />
      case "file": return null
      case "url": return <LinkIcon className="h-3 w-3 dark:text-white" />
      default: return <FileText className="h-3 w-3 dark:text-white" />
    }
  }

  const truncateText = (text: string) => {
    if (!text) return ""
    const lineCount = (text.match(/\n/g) || []).length + 1
    if (isMobile) {
      if ((lineCount > 2 || text.length > 80) && !showFullText) {
        if (lineCount > 2) {
          let pos = text.indexOf('\n')
          if (pos !== -1) {
            pos = text.indexOf('\n', pos + 1)
            if (pos !== -1) return text.substring(0, pos) + "..."
          }
        }
        if (text.length > 80) return text.substring(0, 80) + "..."
      }
    } else {
      if ((lineCount > 3 || text.length > 300) && !showFullText) {
        if (lineCount > 3) {
          let pos = text.indexOf('\n')
          if (pos !== -1) { pos = text.indexOf('\n', pos + 1); if (pos !== -1) { pos = text.indexOf('\n', pos + 1); if (pos !== -1) return text.substring(0, pos) + "..." } }
        }
        if (text.length > 300) return text.substring(0, 300) + "..."
      }
    }
    return text
  }

  const shouldShowExpandButton = (content: string) => {
    if (!content) return false
    const lineCount = (content.match(/\n/g) || []).length + 1
    return isMobile ? lineCount > 2 || content.length > 80 : lineCount > 3 || content.length > 300
  }

  const isImageFile = () => {
    if (item.fileType?.startsWith("image/")) return true
    if (item.fileName) {
      const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico']
      return exts.some(ext => item.fileName!.toLowerCase().endsWith(ext))
    }
    if (item.fileUrl) return /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?|$)/i.test(item.fileUrl)
    return false
  }

  const getFileIcon = () => {
    const t = item.fileType?.toLowerCase() || ''
    if (t.startsWith('image/')) return <ImageIcon className="h-5 w-5 mr-2 text-primary" />
    if (t.startsWith('audio/')) return <FileAudio className="h-5 w-5 mr-2 text-primary" />
    if (t.startsWith('video/')) return <FileVideo className="h-5 w-5 mr-2 text-primary" />
    if (t === 'application/pdf') return <FilePdf className="h-5 w-5 mr-2 text-primary" />
    if (t.includes('zip') || t.includes('compressed') || t.includes('archive')) return <FileArchive className="h-5 w-5 mr-2 text-primary" />
    if (t.includes('javascript') || t.includes('json') || t.includes('html') || t.includes('css') || t.includes('xml') || t.includes('text/plain')) return <FileCode className="h-5 w-5 mr-2 text-primary" />
    return <File className="h-5 w-5 mr-2 text-primary" />
  }

  const getFileTypeDescription = () => {
    const t = item.fileType?.toLowerCase() || ''
    if (t.startsWith('image/')) return `Imagen ${t.split('/')[1]?.toUpperCase() || ''}`
    if (t.startsWith('audio/')) return `Audio ${t.split('/')[1]?.toUpperCase() || ''}`
    if (t.startsWith('video/')) return `Video ${t.split('/')[1]?.toUpperCase() || ''}`
    if (t === 'application/pdf') return 'PDF'
    if (t.includes('zip') || t.includes('compressed') || t.includes('archive')) return 'Comprimido'
    if (t.includes('javascript')) return 'JavaScript'
    if (t.includes('json')) return 'JSON'
    if (t.includes('html')) return 'HTML'
    if (t.includes('css')) return 'CSS'
    if (t.includes('text/plain')) return 'Texto'
    return t.split('/')[1]?.toUpperCase() || t
  }

  // ─── Content renderers ───────────────────────────────────────────────────────

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.altKey) { e.preventDefault(); handleUpdate() }
            }}
            className="mb-2 bg-background border-border text-foreground"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdate} disabled={isLoading}>Guardar</Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditedContent(item.content || "") }} disabled={isLoading} className="dark:text-white dark:border-white/30">
              Cancelar
            </Button>
          </div>
        </div>
      )
    }

    if (item.type === "url") {
      const truncated = truncateText(item.content)
      const showBtn = shouldShowExpandButton(item.content)
      return (
        <div>
          <a href={item.content} target="_blank" rel="noopener noreferrer"
            className={`text-sm lg:text-base text-blue-600 hover:underline dark:text-blue-400 break-words ${!showFullText ? 'inline' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {showFullText ? item.content : truncated}
            {showBtn && !showFullText && (
              <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
                (<button onClick={(e) => { e.stopPropagation(); setShowFullText(true) }} className="text-primary underline inline">ver más</button>)
              </span>
            )}
          </a>
          {showBtn && showFullText && (
            <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
              (<button onClick={(e) => { e.stopPropagation(); setShowFullText(false) }} className="text-primary underline inline">ver menos</button>)
            </span>
          )}
        </div>
      )
    }

    // Image — compact thumbnail for both mobile and desktop
    if (item.type === "file" && isImageFile() && item.fileUrl) {
      return (
        <div className="flex items-center gap-2.5 mt-1">
          <img
            src={item.fileUrl}
            alt={item.fileName || "Imagen"}
            className="h-12 w-12 rounded-md object-cover flex-shrink-0 bg-secondary/30"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{item.fileName}</p>
            <p className="text-xs text-muted-foreground">{item.fileType?.split('/')[1]?.toUpperCase() || 'imagen'}</p>
          </div>
        </div>
      )
    }

    // Non-image file
    if (item.type === "file" && item.fileUrl) {
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

    // Text
    const truncated = truncateText(item.content)
    const showBtn = shouldShowExpandButton(item.content)
    return (
      <div>
        <p className={`text-sm lg:text-base text-foreground break-words whitespace-pre-wrap ${!showFullText ? 'inline' : ''}`}>
          {showFullText ? item.content : truncated}
          {showBtn && !showFullText && (
            <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
              (<button onClick={(e) => { e.stopPropagation(); setShowFullText(true) }} className="text-primary underline inline">ver más</button>)
            </span>
          )}
        </p>
        {showBtn && showFullText && (
          <span className="text-xs lg:text-sm text-primary ml-1 inline-flex items-center">
            (<button onClick={(e) => { e.stopPropagation(); setShowFullText(false) }} className="text-primary underline inline">ver menos</button>)
          </span>
        )}
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Swipe indicators — mobile only */}
      {isMobile && swipeHandlers.isSwipping && (
        <>
          <div className={`absolute left-0 top-0 bottom-0 w-20 flex items-center justify-start pl-4 rounded-l-md transition-all ${swipeHandlers.swipeDirection === 'right' ? 'opacity-100 bg-yellow-500' : 'opacity-0'}`}>
            <Star className="h-7 w-7 text-white" fill="none" strokeWidth={2} />
          </div>
          <div className={`absolute right-0 top-0 bottom-0 w-20 flex items-center justify-end pr-4 rounded-r-md transition-all ${swipeHandlers.swipeDirection === 'left' ? 'opacity-100 bg-red-500' : 'opacity-0'}`}>
            <Trash className="h-7 w-7 text-white" />
          </div>
        </>
      )}

      <div
        className={`group item-card border border-border rounded-md p-2 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all relative ${swipeHandlers.isSwipping ? 'scale-98 shadow-lg' : ''}`}
        style={{
          transform: swipeHandlers.isSwipping ? `translateX(${swipeHandlers.swipeOffset}px)` : 'translateX(0)',
          transition: swipeHandlers.isSwipping ? 'none' : 'transform 0.3s ease-out',
        }}
        onClick={handleCardClick}
        onContextMenu={(e) => e.preventDefault()}
        {...(isMobile ? {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        } : {})}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 overflow-hidden">

            {/* Card header */}
            <div className="flex justify-between items-center">
              {/* Type icon + favorite star (mobile) */}
              <div className="flex items-center gap-1.5">
                {renderIcon() && <div className="text-primary">{renderIcon()}</div>}
                {isMobile && isFavorite && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>

              {/* Desktop action buttons */}
              {!isMobile && (
                <div className="flex gap-0.5">
                  <Button size="icon" variant="ghost" onClick={handleToggleFavorite}
                    className={`h-6 w-6 ${isFavorite ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'}`}
                  >
                    <Star className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
                    <span className="sr-only">{isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</span>
                  </Button>

                  {isImageFile() ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleCopyLink} className="text-muted-foreground h-6 w-6" title="Copiar enlace">
                        <Link2 className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleDownload} className="text-muted-foreground h-6 w-6" title="Descargar">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCopy} className="text-muted-foreground h-6 w-6" title="Copiar imagen">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {!isEditing && item.type !== "file" && (
                        <Button size="icon" variant="ghost" onClick={handleEdit} className="text-muted-foreground h-6 w-6">
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {item.type === "file" && (
                        <Button size="icon" variant="ghost" onClick={handleDownload} className="text-muted-foreground h-6 w-6">
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={handleCopy} className="text-muted-foreground h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  <Button size="icon" variant="ghost" onClick={handleDelete} disabled={isLoading}
                    className="text-red-500 hover:bg-destructive hover:text-white transition-colors h-6 w-6"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mt-0.5">
              {renderContent()}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
