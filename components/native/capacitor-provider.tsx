'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { initPushNotifications } from '@/lib/native/push-notifications';
import { initHaptics } from '@/lib/native/haptics';
import { isNativePlatform } from '@/lib/native/platform';

function fixNativeViewport() {
  // En WKWebView (Capacitor), el font-size fix no alcanza.
  // Actualizamos el viewport para deshabilitar el auto-zoom en inputs.
  const meta = document.querySelector('meta[name=viewport]');
  if (meta) {
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    );
  }
}

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      const native = await isNativePlatform();
      if (!native) return;

      fixNativeViewport();
      await initHaptics();
      if (user?.uid) {
        await initPushNotifications(user.uid);
      }
    };

    init();
  }, [user?.uid]);

  return <>{children}</>;
}
