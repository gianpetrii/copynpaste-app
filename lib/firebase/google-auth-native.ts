'use client';

import { GoogleAuthProvider, signInWithCredential, type User } from 'firebase/auth';
import { auth } from './firebase';
import { getWebUrl } from '@/lib/utils/api-url';
import { agentLog } from '@/lib/debug/agent-log';

const AUTH_CALLBACK_PREFIX = 'copynpaste://auth/callback';
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;

type PendingGoogleAuth = {
  resolve: (user: User) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  browserFinishedListener?: { remove: () => Promise<void> };
};

let pendingGoogleAuth: PendingGoogleAuth | null = null;
let appUrlListenerRegistered = false;

function clearPendingGoogleAuth(error?: Error) {
  if (!pendingGoogleAuth) return;

  clearTimeout(pendingGoogleAuth.timeoutId);
  void pendingGoogleAuth.browserFinishedListener?.remove();
  pendingGoogleAuth = null;

  if (error) {
    agentLog({
      hypothesisId: 'C',
      location: 'google-auth-native:clearPending',
      message: 'Google auth flow cleared with error',
      data: { error: error.message },
    });
  }
}

export async function registerGoogleAuthDeepLinkListener(): Promise<void> {
  if (appUrlListenerRegistered || typeof window === 'undefined') return;

  try {
    const { App } = await import('@capacitor/app');
    await App.addListener('appUrlOpen', (event) => {
      void handleGoogleAuthDeepLink(event.url);
    });
    appUrlListenerRegistered = true;
    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:registerListener',
      message: 'appUrlOpen listener registered',
      data: {},
    });
  } catch (error) {
    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:registerListener',
      message: 'Failed to register appUrlOpen listener',
      data: { error: error instanceof Error ? error.message : 'unknown' },
    });
  }
}

export async function handleGoogleAuthDeepLink(url: string): Promise<boolean> {
  if (!url.startsWith(AUTH_CALLBACK_PREFIX)) return false;

  agentLog({
    hypothesisId: 'D',
    location: 'google-auth-native:deepLink',
    message: 'Auth deep link received',
    data: { hasPending: !!pendingGoogleAuth },
  });

  const parsed = new URL(url.replace('copynpaste://', 'https://local/'));
  const error = parsed.searchParams.get('error');
  const idToken = parsed.searchParams.get('idToken');
  const accessToken = parsed.searchParams.get('accessToken');

  if (!pendingGoogleAuth) {
    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:deepLink',
      message: 'Deep link received without pending auth',
      data: { hasError: !!error, hasToken: !!idToken },
    });
    return true;
  }

  const { resolve, reject } = pendingGoogleAuth;

  try {
    if (error) {
      throw new Error(decodeURIComponent(error));
    }
    if (!idToken) {
      throw new Error('No se recibió el token de Google');
    }

    const credential = GoogleAuthProvider.credential(
      decodeURIComponent(idToken),
      accessToken ? decodeURIComponent(accessToken) : undefined
    );
    const result = await signInWithCredential(auth, credential);

    const { Browser } = await import('@capacitor/browser');
    await Browser.close().catch(() => {});

    clearPendingGoogleAuth();
    resolve(result.user);

    agentLog({
      hypothesisId: 'D',
      location: 'google-auth-native:deepLink',
      message: 'Google sign-in completed via deep link',
      data: { uid: result.user.uid },
      runId: 'post-fix',
    });
  } catch (authError) {
    clearPendingGoogleAuth();
    reject(authError instanceof Error ? authError : new Error('Error de autenticación con Google'));
  }

  return true;
}

export async function signInWithGoogleNative(): Promise<User> {
  await registerGoogleAuthDeepLinkListener();

  agentLog({
    hypothesisId: 'A',
    location: 'google-auth-native:signIn',
    message: 'Starting Browser Google auth',
    data: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
      authUrl: getWebUrl('/native-google-auth'),
    },
  });

  return new Promise<User>(async (resolve, reject) => {
    if (pendingGoogleAuth) {
      reject(new Error('Ya hay un inicio de sesión con Google en curso'));
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!pendingGoogleAuth) return;
      clearPendingGoogleAuth();
      reject(new Error('Tiempo de espera agotado al iniciar sesión con Google'));
    }, AUTH_TIMEOUT_MS);

    pendingGoogleAuth = { resolve, reject, timeoutId };

    try {
      const { Browser } = await import('@capacitor/browser');
      pendingGoogleAuth.browserFinishedListener = await Browser.addListener('browserFinished', () => {
        setTimeout(() => {
          if (!pendingGoogleAuth) return;
          agentLog({
            hypothesisId: 'C',
            location: 'google-auth-native:browserFinished',
            message: 'Browser closed before auth callback',
            data: {},
          });
          const { reject: rejectPending } = pendingGoogleAuth;
          clearPendingGoogleAuth();
          rejectPending(new Error('Inicio de sesión cancelado'));
        }, 800);
      });

      await Browser.open({
        url: getWebUrl('/native-google-auth'),
        presentationStyle: 'popover',
      });

      agentLog({
        hypothesisId: 'B',
        location: 'google-auth-native:signIn',
        message: 'Browser.open resolved',
        data: { authUrl: getWebUrl('/native-google-auth') },
      });
    } catch (error) {
      clearPendingGoogleAuth();
      reject(error instanceof Error ? error : new Error('No se pudo abrir el navegador de autenticación'));
    }
  });
}
