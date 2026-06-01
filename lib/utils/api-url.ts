const DEFAULT_BASE_URL = 'https://copynpaste.app';

/**
 * Resuelve la URL base del servidor API.
 * En Capacitor siempre usa URL absoluta; en web usa relativa si no hay base configurada.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL;
}

/**
 * Construye la URL completa para un endpoint de API.
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getBaseUrl().replace(/\/$/, '');

  if (base) {
    return `${base}${normalizedPath}`;
  }

  return normalizedPath;
}

/**
 * URL pública del sitio web (para pagos externos en apps nativas).
 */
export function getWebUrl(path: string = ''): string {
  const normalizedPath = path.startsWith('/') ? path : path ? `/${path}` : '';
  const base = (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  return `${base}${normalizedPath}`;
}
