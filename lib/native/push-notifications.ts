'use client';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { logger } from '@/lib/utils/logger';
import { isNativePlatform } from './platform';

export async function initPushNotifications(userId?: string): Promise<void> {
  const native = await isNativePlatform();
  if (!native || !userId) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      logger.info('Push notification permission denied');
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', async (token) => {
      if (token.value && db) {
        await setDoc(
          doc(db, 'user_devices', `${userId}_fcm`),
          {
            userId,
            fcmToken: token.value,
            platform: 'native',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        logger.info('Push token registered', { userId });
      }
    });

    await PushNotifications.addListener('registrationError', (error) => {
      logger.warn('Push registration error', { error });
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      logger.info('Push notification received', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      logger.info('Push notification action performed', action);
    });
  } catch (error) {
    logger.warn('Push notifications not available', { error });
  }
}

export async function removePushToken(userId: string): Promise<void> {
  if (!db) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    await PushNotifications.removeAllListeners();
    await setDoc(doc(db, 'user_devices', `${userId}_fcm`), { fcmToken: null }, { merge: true });
  } catch {
    // ignore
  }
}
