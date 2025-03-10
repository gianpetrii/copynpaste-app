import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDate(dateInput: Date | string | number): string {
  try {
    // Asegurarse de que tenemos un objeto Date
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith("image/")) {
    return "image"
  } else if (fileType.startsWith("video/")) {
    return "video"
  } else if (fileType.startsWith("audio/")) {
    return "audio"
  } else if (fileType.includes("pdf")) {
    return "pdf"
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return "document"
  } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
    return "spreadsheet"
  } else if (fileType.includes("powerpoint") || fileType.includes("presentation")) {
    return "presentation"
  } else {
    return "file"
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

