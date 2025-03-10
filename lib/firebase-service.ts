import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { logEvent, getAnalytics } from "firebase/analytics"
import type { Item } from "@/types"

export async function addItem({
  type,
  content = "",
  file = null,
  userId,
}: {
  type: "text" | "url" | "file"
  content?: string
  file?: File | null
  userId: string
}) {
  try {
    let fileUrl = ""
    let fileName = ""
    let fileType = ""
    let fileSize = 0

    if (type === "file" && file) {
      fileName = file.name
      fileType = file.type
      fileSize = file.size

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `files/${userId}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      fileUrl = await getDownloadURL(storageRef)
    }

    // Add document to Firestore
    const docRef = await addDoc(collection(db, "items"), {
      type,
      content: type === "file" ? "" : content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      fileUrl,
      fileName,
      fileType,
      fileSize,
    })

    // Log event to analytics
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "item_added", {
        item_type: type,
        has_file: !!fileUrl,
      })
    }

    return docRef.id
  } catch (error: any) {
    console.error("Error adding item:", error)
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "add_item_error", { error: error.message })
    }
    throw error
  }
}

export async function updateItem(id: string, data: Partial<Item>) {
  try {
    const docRef = doc(db, "items", id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    // Log event to analytics
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "item_updated")
    }
  } catch (error: any) {
    console.error("Error updating item:", error)
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "update_item_error", { id, error: error.message })
    }
    throw error
  }
}

export async function deleteItem(id: string) {
  try {
    // Get the item to check if it has a file
    const docRef = doc(db, "items", id)

    // Delete the document from Firestore
    await deleteDoc(docRef)

    // Log event to analytics
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "item_deleted")
    }
  } catch (error: any) {
    console.error("Error deleting item:", error)
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "delete_item_error", { id, error: error.message })
    }
    throw error
  }
}

export async function getItems(userId: string) {
  try {
    const q = query(collection(db, "items"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    return new Promise<Item[]>((resolve, reject) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: Item[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          items.push({
            id: doc.id,
            type: data.type,
            content: data.content,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            fileUrl: data.fileUrl || "",
            fileName: data.fileName || "",
            fileType: data.fileType || "",
            fileSize: data.fileSize || 0,
          })
        })
        
        unsubscribe()
        resolve(items)
      }, (error) => {
        reject(error)
      })
    })
  } catch (error: any) {
    console.error("Error getting items:", error)
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "get_items_error", { userId, error: error.message })
    }
    throw error
  }
}

export function subscribeToItems(userId: string, callback: (items: Item[]) => void) {
  try {
    const q = query(collection(db, "items"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: Item[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          type: data.type,
          content: data.content,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          fileUrl: data.fileUrl || "",
          fileName: data.fileName || "",
          fileType: data.fileType || "",
          fileSize: data.fileSize || 0,
        })
      })

      callback(items)
    })

    return unsubscribe
  } catch (error: any) {
    console.error("Error subscribing to items:", error)
    if (typeof window !== "undefined") {
      const analytics = getAnalytics();
      logEvent(analytics, "subscribe_items_error", { userId, error: error.message })
    }
    throw error
  }
}

