"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Paperclip, Info, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/components/use-toast"
import { useItems } from "@/lib/hooks"
import { useAuth } from "@/lib/context/auth-context"
import { validateFile, validateUrl, validateInput, generateSafeFileName } from "@/lib/utils/validation"
import { logger } from "@/lib/utils/logger"
import ItemLimitModal from "@/components/features/limits/item-limit-modal"
import { useClipboardPaste, type ClipboardImageData } from "@/lib/hooks/use-clipboard-paste"
import { ImagePreview } from "@/components/ui/image-preview"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AddItemForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const userId = user?.uid || ""
  const { addItem, items } = useItems(userId)
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState("")
  const [showLimitModal, setShowLimitModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [clipboardImage, setClipboardImage] = useState<ClipboardImageData | null>(null)
  const [isUploadingClipboard, setIsUploadingClipboard] = useState(false)

  const isAuthenticated = !!userId

  // Detectar si el contenido es una URL válida
  const urlDetection = validateUrl(text.trim())
  const isUrl = text.trim().length > 0 && urlDetection.isValid

  const handleSubmit = async () => {
    if (!isAuthenticated) return

    if (isUrl) {
      await handleUrlSubmit()
    } else {
      await handleTextSubmit()
    }
  }

  const handleTextSubmit = async () => {
    const validation = validateInput(text, 5000)
    if (!validation.isValid) {
      toast({ title: "Error de validación", description: validation.error, variant: "destructive" })
      return
    }
    try {
      setIsSubmitting(true)
      await addItem({ type: "text", content: validation.sanitized!, userId })
      setText("")
      toast({ title: "Guardado", description: "Texto guardado correctamente" })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true)
        setIsSubmitting(false)
        return
      }
      toast({ title: "Error al guardar", description: "Ocurrió un error al guardar", variant: "destructive" })
      logger.databaseError("Error al guardar texto", error, undefined, userId)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUrlSubmit = async () => {
    const urlValidation = validateUrl(text.trim())
    if (!urlValidation.isValid) {
      toast({ title: "URL inválida", description: urlValidation.error, variant: "destructive" })
      return
    }
    try {
      setIsSubmitting(true)
      await addItem({ type: "url", content: urlValidation.normalizedUrl!, userId })
      setText("")
      toast({ title: "Guardado", description: "Enlace guardado correctamente" })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true)
        setIsSubmitting(false)
        return
      }
      toast({ title: "Error al guardar", description: "Ocurrió un error al guardar el enlace", variant: "destructive" })
      logger.databaseError("Error al guardar URL", error, undefined, userId)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.altKey) return
      e.preventDefault()
      if (text.trim()) handleSubmit()
    }
  }

  const handleFileSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !isAuthenticated) return
    const file = e.target.files[0]

    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      toast({ title: "Archivo inválido", description: fileValidation.error, variant: "destructive" })
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    try {
      setIsSubmitting(true)
      const safeFileName = generateSafeFileName(file.name)
      setCurrentFileName(file.name)
      setUploadProgress(0)

      await addItem(
        { type: "file", file, fileName: safeFileName, fileType: file.type, fileSize: file.size, userId },
        (progress, fileName) => { setUploadProgress(progress); setCurrentFileName(fileName) }
      )

      if (fileInputRef.current) fileInputRef.current.value = ""
      toast({ title: "Guardado", description: `"${file.name}" guardado correctamente` })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true)
        setIsSubmitting(false)
        setUploadProgress(0)
        setCurrentFileName("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }
      toast({ title: "Error al guardar", description: "Ocurrió un error al guardar el archivo", variant: "destructive" })
      logger.fileError("Error al guardar archivo", error, file.name, userId)
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
      setCurrentFileName("")
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleClipboardImagePaste = (imageData: ClipboardImageData) => {
    setClipboardImage(imageData)
    toast({ title: "Imagen detectada", description: `Imagen pegada desde el portapapeles (${imageData.name})` })
    logger.info('Imagen pegada desde clipboard', { fileName: imageData.name, size: imageData.size, type: imageData.type, userId })
  }

  const handleClipboardTextPaste = (pastedText: string) => {
    if (!clipboardImage) {
      setText(pastedText)
    }
  }

  const handleClipboardImageUpload = async () => {
    if (!clipboardImage || !isAuthenticated) return
    try {
      setIsUploadingClipboard(true)
      setUploadProgress(0)
      setCurrentFileName(clipboardImage.name)

      await addItem(
        { type: "file", file: clipboardImage.file, fileName: clipboardImage.name, fileType: clipboardImage.type, fileSize: clipboardImage.size, userId },
        (progress, fileName) => { setUploadProgress(progress); if (fileName) setCurrentFileName(fileName) }
      )

      toast({ title: "Imagen guardada", description: "La imagen del portapapeles ha sido guardada correctamente" })
      setClipboardImage(null)
      setUploadProgress(0)
      setCurrentFileName("")
      logger.info('Imagen del clipboard guardada exitosamente', { fileName: clipboardImage.name, userId })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true)
        setIsUploadingClipboard(false)
        return
      }
      toast({ title: "Error al guardar", description: "Ocurrió un error al guardar la imagen", variant: "destructive" })
      logger.databaseError("Error al guardar imagen del clipboard", error, undefined, userId)
    } finally {
      setIsUploadingClipboard(false)
    }
  }

  const handleRemoveClipboardImage = () => {
    setClipboardImage(null)
  }

  useClipboardPaste({
    onImagePaste: handleClipboardImagePaste,
    onTextPaste: handleClipboardTextPaste,
    enabled: isAuthenticated,
    maxSize: 10 * 1024 * 1024,
    acceptedImageTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
  })

  if (!isAuthenticated) {
    return (
      <div className="bg-secondary rounded-xl shadow-sm p-4 text-center">
        <p className="text-secondary-foreground text-sm">Debes iniciar sesión para guardar elementos.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-secondary/50 border border-border rounded-lg shadow-sm p-1.5 mb-2">

        {/* Imagen pegada desde clipboard */}
        {clipboardImage ? (
          <ImagePreview
            src={clipboardImage.dataUrl}
            alt={clipboardImage.name}
            size={clipboardImage.size}
            type={clipboardImage.type}
            fileName={clipboardImage.name}
            onRemove={handleRemoveClipboardImage}
            onUpload={handleClipboardImageUpload}
            uploading={isUploadingClipboard}
            className="w-full"
          />
        ) : (
          <>
            {/* Textarea unificado — texto o URL */}
            <div className="relative">
              <Textarea
                placeholder="Escribí, pegá texto o una URL... (Enter: guardar, Alt+Enter: nueva línea)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[52px] resize-none bg-background border-border focus:ring-1 focus:ring-ring text-foreground pr-2 text-sm"
              />
              {/* Badge de URL detectada */}
              {isUrl && (
                <span className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-full pointer-events-none">
                  <LinkIcon className="h-2.5 w-2.5" />
                  Enlace
                </span>
              )}
            </div>

            {/* Barra de acciones */}
            <div className="flex items-center justify-between mt-1.5 gap-1.5">
              <div className="flex items-center gap-1">
                {/* Botón archivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSubmit}
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.mp3,.wav,.ogg,.mp4,.webm,.json,.html,.css"
                />
                {isSubmitting && currentFileName ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    <span className="truncate max-w-[120px]">{currentFileName} {uploadProgress.toFixed(0)}%</span>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Paperclip className="h-3 w-3" />
                    Archivo
                  </label>
                )}

                {/* Info tooltip de límites */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                        <Info className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                      Máx. 10 MB · Imágenes, docs, audio, video, zip
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Botón guardar */}
              <Button
                className="h-7 px-3 add-button button-primary text-xs"
                onClick={handleSubmit}
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting && !currentFileName ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      <ItemLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentItemCount={items.length}
      />
    </div>
  )
}
