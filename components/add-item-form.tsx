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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextSubmit = async () => {
    if (!text.trim()) return

    try {
      setIsSubmitting(true)
      await addItem({
        type: "text",
        content: text,
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
    if (!url.trim()) return

    try {
      setIsSubmitting(true)
      await addItem({
        type: "url",
        content: url,
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

  const handleFileSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    try {
      setIsSubmitting(true)
      const file = e.target.files[0]

      // Crear una URL para el archivo local
      const fileUrl = URL.createObjectURL(file)

      await addItem({
        type: "file",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: fileUrl,
      })

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
    }
  }

  return (
    <div className="p-4">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md p-3 mb-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "file")}>
          <TabsList className="grid grid-cols-2 w-full dark:bg-gray-800">
            <TabsTrigger value="text" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-900">
              Texto
            </TabsTrigger>
            <TabsTrigger value="file" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-900">
              Archivo
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="p-4">
            <Textarea
              placeholder="Ingresa tu texto aquí"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <div className="mt-2">
              <Input
                type="url"
                placeholder="O ingresa un enlace"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
            <Button
              className="w-full mt-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              onClick={url ? handleUrlSubmit : handleTextSubmit}
              disabled={isSubmitting || (!text && !url)}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </TabsContent>
          <TabsContent value="file" className="p-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center dark:border-gray-600 dark:text-white">
              <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSubmit} id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm font-medium">Haz clic para seleccionar un archivo</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">O arrastra y suelta aquí</span>
              </label>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

