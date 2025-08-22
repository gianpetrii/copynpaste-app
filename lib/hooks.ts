"use client"

import { useState, useEffect } from "react"
import type { Item } from "@/types"
import { addDocument, getDocuments, updateDocument, deleteDocument, subscribeToItems } from "@/lib/firebase/firestore"
import { uploadFile, deleteFile } from "@/lib/firebase/storage"
import { sanitizeText } from "@/lib/utils/validation"
import { logger } from "@/lib/utils/logger"
import { PLAN_LIMITS, getUserPlan } from "@/lib/firebase/device-manager"

// Interfaz para el resultado de uploadFile
interface UploadFileResult {
  path: string;
  downloadURL: string;
  name: string;
  type: string;
  size: number;
}

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

  // Cargar los items del usuario desde Firestore con actualizaciones en tiempo real
  useEffect(() => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return () => {}; // Retornar una función de limpieza vacía
    }

    setLoading(true)
    
    // Usar subscribeToItems para obtener actualizaciones en tiempo real
    const unsubscribe = subscribeToItems(userId, (updatedItems) => {
      // Asegurarse de que solo se muestren los items del usuario actual
      const userItems = updatedItems.filter(item => item.userId === userId);
      setItems(userItems);
      setLoading(false);
    });
    
    // Limpiar la suscripción cuando el componente se desmonte o cambie el userId
    return () => {
      unsubscribe();
    };
  }, [userId]);

  const addItem = async (itemData: Partial<Item>, onProgress?: (progress: number, fileName: string) => void) => {
    if (!userId) throw new Error("Usuario no autenticado")

    // Verificar límites del plan antes de crear el item
    const userPlan = await getUserPlan(userId);
    const planLimits = PLAN_LIMITS[userPlan];
    
    if (planLimits.maxItems > 0 && items.length >= planLimits.maxItems) {
      throw new Error(`LIMIT_REACHED:${items.length}:${planLimits.maxItems}`);
    }

    try {
      let fileData = {}
      
      // Si es un archivo, subirlo a Firebase Storage
      if (itemData.type === "file" && itemData.file) {
        const file = itemData.file
        
        // Subir el archivo a Firebase Storage
        const filePath = `users/${userId}/files/${Date.now()}_${file.name}`
        const uploadedFile = await uploadFile(file, filePath, onProgress) as UploadFileResult
        
        fileData = {
          fileUrl: uploadedFile.downloadURL,
          filePath: uploadedFile.path
        }
      }

      // Crear el nuevo item en Firestore con contenido sanitizado
      const newItem = {
        type: itemData.type || "text",
        content: sanitizeText(itemData.content || ""), // Sanitizar contenido
        userId, // Always use the authenticated user's ID
        fileName: itemData.fileName || "",
        fileType: itemData.fileType || "",
        fileSize: itemData.fileSize || 0,
        favorite: itemData.favorite || false,
        ...fileData
      }

      // Agregar el documento a Firestore
      // La suscripción se encargará de actualizar la lista automáticamente
      return await addDocument("items", newItem)
    } catch (error) {
      logger.databaseError("Error al añadir item", error, undefined, userId)
      throw error
    }
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    if (!userId) throw new Error("Usuario no autenticado")

    try {
      // Verify the item belongs to the current user
      const itemToUpdate = items.find(item => item.id === id)
      if (!itemToUpdate || itemToUpdate.userId !== userId) {
        throw new Error("No tienes permiso para actualizar este elemento")
      }
      
      // Sanitizar contenido si se está actualizando
      const sanitizedData = { ...data }
      if (data.content) {
        sanitizedData.content = sanitizeText(data.content)
      }
      
      // Actualizar el documento en Firestore
      // La suscripción se encargará de actualizar la lista automáticamente
      await updateDocument("items", id, sanitizedData)
    } catch (error) {
      logger.databaseError("Error al actualizar item", error, id, userId)
      throw error
    }
  }

  const deleteItem = async (id: string) => {
    if (!userId) throw new Error("Usuario no autenticado")

    try {
      // Verify the item belongs to the current user
      const itemToDelete = items.find(item => item.id === id)
      if (!itemToDelete || itemToDelete.userId !== userId) {
        throw new Error("No tienes permiso para eliminar este elemento")
      }
      
      // Si tiene un archivo, eliminarlo de Storage
      if (itemToDelete?.type === "file" && itemToDelete.filePath) {
        await deleteFile(itemToDelete.filePath)
      }
      
      // Eliminar el documento de Firestore
      // La suscripción se encargará de actualizar la lista automáticamente
      await deleteDocument("items", id)
    } catch (error) {
      logger.databaseError("Error al eliminar item", error, id, userId)
      throw error
    }
  }

  return { items, loading, addItem, updateItem, deleteItem }
}

