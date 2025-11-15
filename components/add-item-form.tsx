"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, AlertTriangle, Image, Clipboard } from "lucide-react"
import { useToast } from "@/components/use-toast"
import { useItems } from "@/lib/hooks"
import { useAuth } from "@/lib/context/auth-context"
import { validateFile, validateUrl, validateInput, generateSafeFileName } from "@/lib/utils/validation"
import { logger } from "@/lib/utils/logger"
import ItemLimitModal from "@/components/features/limits/item-limit-modal"
import { useClipboardPaste, type ClipboardImageData } from "@/lib/hooks/use-clipboard-paste"
import { ImagePreview } from "@/components/ui/image-preview"

export function AddItemForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const userId = user?.uid || ""
  const { addItem, items } = useItems(userId)
  const [activeTab, setActiveTab] = useState<"text" | "file">("text")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState("")
  const [showLimitModal, setShowLimitModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estado para imágenes del clipboard
  const [clipboardImage, setClipboardImage] = useState<ClipboardImageData | null>(null)
  const [isUploadingClipboard, setIsUploadingClipboard] = useState(false)

  // Ensure user is authenticated before allowing submissions
  const isAuthenticated = !!userId

  const handleTextSubmit = async () => {
    if (!isAuthenticated) return

    // Validar y sanitizar contenido
    const validation = validateInput(text, 5000) // 5000 caracteres máximo para texto
    if (!validation.isValid) {
      toast({
        title: "Error de validación",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await addItem({
        type: "text",
        content: validation.sanitized!,
        userId: userId, // Explicitly set userId for security
      })
      setText("")
      toast({
        title: "Texto guardado",
        description: "El texto ha sido guardado correctamente",
      })
    } catch (error) {
      // Manejar error de límite alcanzado
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true);
        setIsSubmitting(false);
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error al guardar",
        description: `Ha ocurrido un error al guardar el texto: ${errorMessage}`,
        variant: "destructive",
      })
      logger.databaseError("Error al guardar texto", error, undefined, userId)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!isAuthenticated) return

    // Validar URL
    const urlValidation = validateUrl(url)
    if (!urlValidation.isValid) {
      toast({
        title: "URL inválida",
        description: urlValidation.error,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await addItem({
        type: "url",
        content: urlValidation.normalizedUrl!, // Usar URL normalizada
        userId: userId, // Explicitly set userId for security
      })
      setUrl("")
      toast({
        title: "Enlace guardado",
        description: "El enlace ha sido guardado correctamente",
      })
    } catch (error) {
      // Manejar error de límite alcanzado
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true);
        setIsSubmitting(false);
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error al guardar",
        description: `Ha ocurrido un error al guardar el enlace: ${errorMessage}`,
        variant: "destructive",
      })
      logger.databaseError("Error al guardar URL", error, undefined, userId)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle key press events for text and URL inputs
  const handleKeyDown = (e: React.KeyboardEvent, type: 'text' | 'url') => {
    if (e.key === 'Enter') {
      if (e.altKey) {
        // Alt+Enter: nueva línea - no hacemos nada, permitimos comportamiento por defecto
        // No llamamos e.preventDefault() para permitir la nueva línea
        return;
      } else {
        // Enter solo: guardar elemento
        e.preventDefault(); // Prevenir nueva línea
      if (type === 'text' && text.trim()) {
        handleTextSubmit();
      } else if (type === 'url' && url.trim()) {
        handleUrlSubmit();
        }
      }
    }
  };

  const handleFileSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !isAuthenticated) return

    const file = e.target.files[0]

    // Validar archivo antes de procesar
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      toast({
        title: "Archivo inválido",
        description: fileValidation.error,
        variant: "destructive",
      })
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Mostrar advertencias si las hay
    if (fileValidation.warnings && fileValidation.warnings.length > 0) {
      toast({
        title: "Advertencia",
        description: fileValidation.warnings.join('. '),
        variant: "default",
      })
    }

    try {
      setIsSubmitting(true)
      const safeFileName = generateSafeFileName(file.name)
      setCurrentFileName(file.name)
      setUploadProgress(0)

      await addItem(
        {
          type: "file",
          file: file,
          fileName: safeFileName, // Usar nombre de archivo seguro
          fileType: file.type,
          fileSize: file.size,
          userId: userId, // Explicitly set userId for security
        },
        (progress, fileName) => {
          setUploadProgress(progress)
          setCurrentFileName(fileName)
        }
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast({
        title: "Archivo guardado",
        description: `El archivo "${file.name}" ha sido guardado correctamente`,
      })
    } catch (error) {
      // Manejar error de límite alcanzado
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true);
        setIsSubmitting(false);
        setUploadProgress(0);
        setCurrentFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error al guardar",
        description: `Ha ocurrido un error al guardar el archivo: ${errorMessage}`,
        variant: "destructive",
      })
      logger.fileError("Error al guardar archivo", error, file.name, userId)
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
      setCurrentFileName("")
      // Limpiar input en caso de error
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Funciones para manejo del clipboard
  const handleClipboardImagePaste = (imageData: ClipboardImageData) => {
    setClipboardImage(imageData)
    
    // Cambiar automáticamente a la pestaña de archivo
    setActiveTab("file")
    
    toast({
      title: "🖼️ Imagen detectada",
      description: `Imagen pegada desde el portapapeles (${imageData.name})`,
    })
    
    logger.info('Imagen pegada desde clipboard', {
      fileName: imageData.name,
      size: imageData.size,
      type: imageData.type,
      userId
    })
  }

  const handleClipboardTextPaste = (pastedText: string) => {
    // Solo actuar si estamos en la pestaña de archivo y no hay imagen pegada
    if (activeTab === "file" && !clipboardImage) {
      // Cambiar automáticamente a la pestaña de texto
      setActiveTab("text")
      
      // Agregar el texto al textarea
      setText(pastedText)
      
      toast({
        title: "📝 Texto detectado",
        description: "Texto pegado desde el portapapeles. Cambiado a pestaña 'Texto'",
      })
      
      logger.info('Texto pegado desde clipboard', {
        textLength: pastedText.length,
        userId
      })
    }
  }

  const handleClipboardImageUpload = async () => {
    if (!clipboardImage || !isAuthenticated) return

    try {
      setIsUploadingClipboard(true)
      setUploadProgress(0)
      setCurrentFileName(clipboardImage.name)

      await addItem(
        {
          type: "file",
          file: clipboardImage.file,
          fileName: clipboardImage.name,
          fileType: clipboardImage.type,
          fileSize: clipboardImage.size,
          userId: userId,
        },
        (progress, fileName) => {
          setUploadProgress(progress)
          if (fileName) setCurrentFileName(fileName)
        }
      )

      toast({
        title: "Imagen guardada",
        description: "La imagen del portapapeles ha sido guardada correctamente",
      })

      // Limpiar estado
      setClipboardImage(null)
      setUploadProgress(0)
      setCurrentFileName("")

      logger.info('Imagen del clipboard guardada exitosamente', {
        fileName: clipboardImage.name,
        userId
      })

    } catch (error) {
      // Manejar error de límite alcanzado
      if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
        setShowLimitModal(true);
        setIsUploadingClipboard(false);
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast({
        title: "Error al guardar",
        description: `Ha ocurrido un error al guardar la imagen: ${errorMessage}`,
        variant: "destructive",
      })
      logger.databaseError("Error al guardar imagen del clipboard", error, undefined, userId)
    } finally {
      setIsUploadingClipboard(false)
    }
  }

  const handleRemoveClipboardImage = () => {
    setClipboardImage(null)
    toast({
      title: "Imagen removida",
      description: "La imagen del portapapeles ha sido removida",
    })
  }

  // Hook para detectar paste de imágenes Y texto
  useClipboardPaste({
    onImagePaste: handleClipboardImagePaste,
    onTextPaste: handleClipboardTextPaste,
    enabled: isAuthenticated,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedImageTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
  })

  // Disable form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="bg-secondary rounded-xl shadow-sm p-6 text-center">
          <p className="text-secondary-foreground mb-4 text-base lg:text-lg">
            Debes iniciar sesión para guardar elementos.
          </p>
          <p className="text-muted-foreground text-sm lg:text-base">
            Tus datos se guardarán de forma segura y solo tú podrás acceder a ellos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-secondary/50 border border-border rounded-lg shadow-sm p-1.5 sm:p-2 mb-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "file")}>
          <TabsList className="grid grid-cols-2 w-full bg-muted h-6 sm:h-7">
            <TabsTrigger value="text" className="data-[state=active]:bg-background text-sm lg:text-base py-0.5">
              Texto
            </TabsTrigger>
            <TabsTrigger value="file" className="data-[state=active]:bg-background text-sm lg:text-base py-0.5">
              Archivo
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="p-1 sm:p-1.5 space-y-1 sm:space-y-1.5">
            <Textarea
              placeholder="Texto (Enter: guardar, Alt+Enter: nueva línea)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'text')}
              className="min-h-[50px] sm:min-h-[55px] resize-none bg-background border-border focus:ring-1 focus:ring-ring text-foreground"
            />
              <Input
              placeholder="Enlace (Enter: guardar)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'url')}
              className="h-8 sm:h-9 bg-background border-border focus:ring-1 focus:ring-ring text-foreground"
              />
            <Button
              className="w-full h-7 sm:h-8 add-button button-primary text-sm lg:text-base"
              onClick={url ? handleUrlSubmit : handleTextSubmit}
              disabled={isSubmitting || (!text.trim() && !url.trim())}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-current mr-1"></div>
                  <span className="text-sm lg:text-base">Guardando...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-sm">Agregar</span>
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="file" className="p-1 sm:p-1.5">
            {/* Vista previa de imagen del clipboard - DENTRO de la pestaña archivo */}
            {clipboardImage ? (
              <div className="space-y-2">
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
              </div>
            ) : (
              <>
                {/* Información sobre límites de archivo */}
                <div className="mb-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">Límites:</span>
                  </div>
                  <div>• Tamaño máximo: 10MB</div>
                  <div>• Tipos: Imágenes, documentos, audio, video, archivos comprimidos</div>
                </div>
                
                <div className="border-2 border-dashed rounded-md p-2 sm:p-2.5 text-center border-border hover:border-primary/50 transition-colors">
                  <Input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSubmit} 
                    id="file-upload"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.mp3,.wav,.ogg,.mp4,.webm,.json,.html,.css"
                  />
                  <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center justify-center ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary mb-1"></div>
                        <span className="text-xs font-medium">Subiendo: {currentFileName}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{uploadProgress.toFixed(0)}%</span>
                        
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300 ease-in-out" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mb-1 text-primary"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-xs font-medium">Seleccionar archivo</span>
                        <span className="text-xs text-muted-foreground mt-0.5">O arrastra aquí</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Tip de pegado de imágenes - solo cuando no hay imagen pegada */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-emerald-500 rounded flex-shrink-0">
                      <Clipboard className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        💡 <kbd className="px-1 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded text-xs font-mono">Ctrl+V</kbd> para pegar imágenes
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>



      {/* Modal de límite de items */}
      <ItemLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentItemCount={items.length}
      />
    </div>
  )
} 