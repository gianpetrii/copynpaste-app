import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './firebase';

// Función para subir un archivo a Firebase Storage
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      path,
      downloadURL,
      name: file.name,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
};

// Función para obtener la URL de descarga de un archivo
export const getFileURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error al obtener URL de archivo:', error);
    throw error;
  }
};

// Función para eliminar un archivo
export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};

// Función para listar archivos en una carpeta
export const listFiles = async (folderPath: string) => {
  try {
    const folderRef = ref(storage, folderPath);
    const fileList = await listAll(folderRef);
    
    const files = await Promise.all(
      fileList.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url
        };
      })
    );
    
    return files;
  } catch (error) {
    console.error('Error al listar archivos:', error);
    throw error;
  }
}; 