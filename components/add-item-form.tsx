"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useItems } from "@/lib/hooks"
import { useAuth } from "@/lib/context/auth-context"

export function AddItemForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const userId = user?.uid || ""
  const { addItem } = useItems(userId)
  const [activeTab, setActiveTab] = useState<"text" | "file">("text")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ensure user is authenticated before allowing submissions
  const isAuthenticated = !!userId

  const handleTextSubmit = async () => {
    if (!text.trim() || !isAuthenticated) return

    try {
      setIsSubmitting(true)
      await addItem({
        type: "text",
        content: text,
        userId: userId, // Explicitly set userId for security
      })
      setText("")
      toast({
        title: "Texto guardado",
        description: "El texto ha sido guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar el texto",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!url.trim() || !isAuthenticated) return

    try {
      setIsSubmitting(true)
      await addItem({
        type: "url",
        content: url,
        userId: userId, // Explicitly set userId for security
      })
      setUrl("")
      toast({
        title: "Enlace guardado",
        description: "El enlace ha sido guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar el enlace",
        variant: "destructive",
      })
      console.error(error)
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

    try {
      setIsSubmitting(true)
      const file = e.target.files[0]
      setCurrentFileName(file.name)
      setUploadProgress(0)

      await addItem(
        {
          type: "file",
          file: file,
          fileName: file.name,
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
        description: "El archivo ha sido guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar el archivo",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
      setCurrentFileName("")
    }
  }

  // Disable form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="bg-secondary rounded-xl shadow-sm p-6 text-center">
          <p className="text-secondary-foreground mb-4">
            Debes iniciar sesión para guardar elementos.
          </p>
          <p className="text-muted-foreground text-sm">
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
            <TabsTrigger value="text" className="data-[state=active]:bg-background text-sm py-0.5">
              Texto
            </TabsTrigger>
            <TabsTrigger value="file" className="data-[state=active]:bg-background text-sm py-0.5">
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
              className="w-full h-7 sm:h-8 add-button button-primary text-sm"
              onClick={url ? handleUrlSubmit : handleTextSubmit}
              disabled={isSubmitting || (!text && !url)}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-b-2 border-current mr-1"></div>
                  <span className="text-sm">Guardando...</span>
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
            <div className="border-2 border-dashed rounded-md p-2 sm:p-2.5 text-center border-border hover:border-primary/50 transition-colors">
              <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSubmit} id="file-upload" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 