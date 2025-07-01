// Validación de archivos
export const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    // Imágenes
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documentos
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archivos comprimidos
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio/Video
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm',
    // Código
    'application/json', 'application/javascript', 'text/html', 'text/css'
  ],
  DANGEROUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.jar']
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export function validateFile(file: File): FileValidationResult {
  const warnings: string[] = []
  
  // Validar tamaño
  if (file.size > FILE_VALIDATION.MAX_SIZE) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo permitido: ${(FILE_VALIDATION.MAX_SIZE / 1024 / 1024).toFixed(1)}MB`
    }
  }
  
  // Validar tipo MIME
  if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido: ${file.type || 'desconocido'}`
    }
  }
  
  // Validar extensión peligrosa
  const fileName = file.name.toLowerCase()
  const hasDangerousExtension = FILE_VALIDATION.DANGEROUS_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  )
  
  if (hasDangerousExtension) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido por seguridad'
    }
  }
  
  // Validar nombre de archivo
  if (fileName.length > 100) {
    warnings.push('Nombre de archivo muy largo, será truncado')
  }
  
  // Caracteres especiales en nombre
  if (!/^[a-zA-Z0-9._\-\s()]+$/.test(fileName)) {
    warnings.push('El nombre contiene caracteres especiales que pueden causar problemas')
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Validación de URLs
export function validateUrl(url: string): { isValid: boolean; error?: string; normalizedUrl?: string } {
  const trimmedUrl = url.trim()
  
  if (!trimmedUrl) {
    return { isValid: false, error: 'La URL no puede estar vacía' }
  }
  
  try {
    // Agregar protocolo si no existe
    let normalizedUrl = trimmedUrl
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      normalizedUrl = `https://${trimmedUrl}`
    }
    
    const urlObj = new URL(normalizedUrl)
    
    // Validar que sea HTTP o HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Solo se permiten URLs HTTP y HTTPS' }
    }
    
    // Validar que tenga un dominio válido
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return { isValid: false, error: 'URL inválida: dominio no válido' }
    }
    
    return { isValid: true, normalizedUrl }
  } catch (error) {
    return { isValid: false, error: 'Formato de URL inválido' }
  }
}

// Sanitización de contenido de texto
export function sanitizeText(text: string): string {
  return text
    .trim()
    // Remover caracteres de control pero mantener saltos de línea
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limitar longitud máxima
    .substring(0, 10000)
}

// Generar nombre de archivo seguro
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now()
  const cleanName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50)
  
  return `${timestamp}_${cleanName}`
}

// Validación de entrada general
export function validateInput(value: string, maxLength: number = 1000): { isValid: boolean; error?: string; sanitized?: string } {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El campo no puede estar vacío' }
  }
  
  const sanitized = sanitizeText(value)
  
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `El contenido excede el límite de ${maxLength} caracteres` }
  }
  
  return { isValid: true, sanitized }
} 