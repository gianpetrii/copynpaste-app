'use client';

import { logger } from '@/lib/utils/logger';
import { isNativePlatform } from './platform';

export async function nativeShare(options: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  const native = await isNativePlatform();

  if (native) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        files: options.files?.map((f) => URL.createObjectURL(f)),
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancel')) return false;
      logger.warn('Native share failed, falling back to Web Share API', { error });
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
        files: options.files,
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function nativeShareFile(file: File, title?: string): Promise<boolean> {
  // Capacitor Share converts files to blob: URLs which iOS cannot sandbox-extend.
  // Use Web Share API directly so iOS receives proper File objects.
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const canShare = navigator.canShare?.({ files: [file] }) ?? true;
      if (canShare) {
        await navigator.share({ title, files: [file] });
        return true;
      }
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('cancel'))) {
        return false;
      }
    }
  }
  return nativeShare({ title, files: [file] });
}
