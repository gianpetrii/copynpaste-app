'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { initPushNotifications } from '@/lib/native/push-notifications';
import { initHaptics } from '@/lib/native/haptics';
import { isNativePlatform } from '@/lib/native/platform';

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      const native = await isNativePlatform();
      if (!native) return;

      await initHaptics();
      if (user?.uid) {
        await initPushNotifications(user.uid);
      }
    };

    init();
  }, [user?.uid]);

  return <>{children}</>;
}
