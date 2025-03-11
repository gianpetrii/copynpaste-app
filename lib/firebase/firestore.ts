import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Item } from '@/types';

// Función para añadir un documento a una colección
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al añadir documento:', error);
    throw error;
  }
};

// Función para actualizar un documento
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    throw error;
  }
};

// Función para eliminar un documento
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    throw error;
  }
};

// Función para obtener un documento por ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener documento:', error);
    throw error;
  }
};

// Función para obtener documentos de una colección con filtros opcionales
export const getDocuments = async (
  collectionName: string, 
  filters: { field: string; operator: string; value: any }[] = [],
  sortBy: { field: string; direction: 'asc' | 'desc' }[] = []
) => {
  try {
    let q = query(collection(db, collectionName));
    
    // Aplicar filtros si existen
    if (filters.length > 0) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator as any, filter.value));
      });
    }
    
    // Aplicar ordenamiento si existe
    if (sortBy.length > 0) {
      sortBy.forEach(sort => {
        q = query(q, orderBy(sort.field, sort.direction));
      });
    }
    
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }
};

// Función para suscribirse a cambios en tiempo real en una colección
export const subscribeToItems = (
  userId: string,
  callback: (items: Item[]) => void
) => {
  try {
    // Crear una consulta para obtener los elementos del usuario ordenados por fecha de creación
    const q = query(
      collection(db, 'items'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Crear una suscripción a los cambios en la consulta
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: Item[] = [];

      // Procesar cada documento en el resultado de la consulta
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          type: data.type,
          content: data.content || '',
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || '',
          fileType: data.fileType || '',
          fileSize: data.fileSize || 0,
          favorite: data.favorite || false,
          filePath: data.filePath || '',
        });
      });

      // Llamar al callback con los elementos actualizados
      callback(items);
    });

    // Devolver la función para cancelar la suscripción
    return unsubscribe;
  } catch (error) {
    console.error('Error al suscribirse a los elementos:', error);
    throw error;
  }
}; 