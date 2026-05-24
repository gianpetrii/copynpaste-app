'use client';

import { logger } from '@/lib/utils/logger';

const BIOMETRIC_ENABLED_KEY = 'biometric_login_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'copynpaste_biometric_credentials';

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function enableBiometricLogin(email: string, password: string): Promise<boolean> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.setCredentials({
      username: email,
      password,
      server: 'copynpaste.app',
    });
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    logger.error('Error enabling biometric login', { error });
    return false;
  }
}

export async function disableBiometricLogin(): Promise<void> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.deleteCredentials({ server: 'copynpaste.app' });
  } catch {
    // ignore
  }
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  localStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
}

export function isBiometricLoginEnabled(): boolean {
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
}

export async function authenticateWithBiometric(): Promise<{ email: string; password: string } | null> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');

    await NativeBiometric.verifyIdentity({
      reason: 'Iniciar sesión en CopyNPaste',
      title: 'Autenticación biométrica',
      subtitle: 'Usa Face ID o huella digital',
      description: 'Confirma tu identidad para acceder',
    });

    const credentials = await NativeBiometric.getCredentials({ server: 'copynpaste.app' });
    return { email: credentials.username, password: credentials.password };
  } catch (error) {
    logger.warn('Biometric authentication failed or cancelled', { error });
    return null;
  }
}
