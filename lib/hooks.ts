"use client"

import { useState, useEffect } from "react"
import type { Item } from "@/types"
import { addDocument, getDocuments, updateDocument, deleteDocument } from "@/lib/firebase/firestore"
import { uploadFile, deleteFile } from "@/lib/firebase/storage"

// Hook para gestionar el almacenamiento local
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      
      // Parse the stored JSON
      const parsed = JSON.parse(item)
      
      // If we're storing items, convert date strings back to Date objects
      if (Array.isArray(parsed) && parsed.length > 0 && 'createdAt' in parsed[0]) {
        return parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      }
      
      return parsed
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

// Hook para gestionar los items
export function useItems(userId: string) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar los items del usuario desde Firestore
  useEffect(() => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    const loadItems = async () => {
      try {
        setLoading(true)
        const filters = [{ field: "userId", operator: "==", value: userId }]
        const sortBy = [{ field: "createdAt", direction: "desc" as const }]
        
        const itemsData = await getDocuments("items", filters, sortBy)
        
        // Convertir timestamps de Firestore a objetos Date
        const formattedItems = itemsData.map(item => ({
          ...item,
          createdAt: item.createdAt?.toDate() || new Date(),
          updatedAt: item.updatedAt?.toDate() || new Date()
        })) as Item[]
        
        setItems(formattedItems)
      } catch (error) {
        console.error("Error al cargar los items:", error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [userId])

  const addItem = async (itemData: Partial<Item>) => {
    if (!userId) throw new Error("Usuario no autenticado")

    try {
      let fileData = {}
      
      // Si es un archivo, subirlo a Firebase Storage
      if (itemData.type === "file" && itemData.fileUrl) {
        // Convertir la URL del objeto a un archivo
        const response = await fetch(itemData.fileUrl)
        const blob = await response.blob()
        const file = new File([blob], itemData.fileName || "file", { type: itemData.fileType || "" })
        
        // Subir el archivo a Firebase Storage
        const filePath = `users/${userId}/files/${Date.now()}_${file.name}`
        const uploadedFile = await uploadFile(file, filePath)
        
        fileData = {
          fileUrl: uploadedFile.downloadURL,
          filePath: uploadedFile.path
        }
      }

      // Crear el nuevo item en Firestore
      const newItem = {
        type: itemData.type || "text",
        content: itemData.content || "",
        userId,
        fileName: itemData.fileName || "",
        fileType: itemData.fileType || "",
        fileSize: itemData.fileSize || 0,
        favorite: itemData.favorite || false,
        ...fileData
      }

      const itemId = await addDocument("items", newItem)
      
      // Obtener el documento recién creado para tener los timestamps
      const createdItem = await getDocuments("items", [
        { field: "userId", operator: "==", value: userId },
        { field: "__name__", operator: "==", value: itemId }
      ])
      
      if (createdItem.length > 0) {
        const formattedItem = {
          ...createdItem[0],
          id: itemId,
          createdAt: createdItem[0].createdAt?.toDate() || new Date(),
          updatedAt: createdItem[0].updatedAt?.toDate() || new Date()
        } as Item
        
        // Actualizar el estado local
        setItems(prevItems => [formattedItem, ...prevItems])
        return itemId
      }
      
      return itemId
    } catch (error) {
      console.error("Error al añadir item:", error)
      throw error
    }
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    if (!userId) throw new Error("Usuario no autenticado")

    try {
      await updateDocument("items", id, data)
      
      // Actualizar el estado local
      setItems(prevItems =>
        prevItems.map(item => 
          item.id === id 
            ? { ...item, ...data, updatedAt: new Date() } 
            : item
        )
      )
    } catch (error) {
      console.error("Error al actualizar item:", error)
      throw error
    }
  }

  const deleteItem = async (id: string) => {
    if (!userId) throw new Error("Usuario no autenticado")

    try {
      // Obtener el item para ver si tiene un archivo asociado
      const itemToDelete = items.find(item => item.id === id)
      
      // Si tiene un archivo, eliminarlo de Storage
      if (itemToDelete?.type === "file" && itemToDelete.filePath) {
        await deleteFile(itemToDelete.filePath)
      }
      
      // Eliminar el documento de Firestore
      await deleteDocument("items", id)
      
      // Actualizar el estado local
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error al eliminar item:", error)
      throw error
    }
  }

  return { items, loading, addItem, updateItem, deleteItem }
}

