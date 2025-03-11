"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { useItems } from "@/lib/hooks"
import type { Item } from "@/types"
import { FileText, Image, LinkIcon, Trash, Edit, Copy, Download, Star } from "lucide-react"

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

  const handleCopy = async () => {
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

  const handleDelete = async () => {
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

  const handleToggleFavorite = async () => {
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

  const handleDownload = () => {
    if (item.fileUrl) {
      window.open(item.fileUrl, "_blank")
    }
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

  const renderContent = () => {
    if (isEditing) {
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUpdate();
        }
      };
      
      return (
        <div className="mt-2">
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
              onClick={() => {
                setIsEditing(false)
                setEditedContent(item.content || "")
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
      return (
        <a
          href={item.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {item.content}
        </a>
      )
    }

    if (item.type === "file" && item.fileType?.startsWith("image/") && item.fileUrl) {
      return (
        <div className="mt-2">
          <img
            src={item.fileUrl || "/placeholder.svg"}
            alt={item.fileName || "Imagen"}
            className="max-h-40 rounded-md"
          />
          <p className="text-sm text-muted-foreground mt-1">{item.fileName}</p>
        </div>
      )
    }

    return <p className="text-foreground">{item.content}</p>
  }

  return (
    <div 
      className="border border-border rounded-md p-4 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex-1 cursor-pointer" 
          onClick={handleCopy}
        >
          <div className="mt-1 text-primary">{renderIcon()}</div>
          <div>
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
              onClick={() => setIsEditing(true)}
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
      </div>
    </div>
  )
}

