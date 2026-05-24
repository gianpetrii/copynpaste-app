'use client';

import { logger } from '@/lib/utils/logger';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export async function triggerHaptic(style: HapticStyle = 'light'): Promise<void> {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');

    switch (style) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(style === 'heavy' ? 30 : 10);
    }
  }
}

export async function initHaptics(): Promise<void> {
  logger.info('Haptics initialized');
}
