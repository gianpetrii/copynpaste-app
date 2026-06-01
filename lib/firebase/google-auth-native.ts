'use client';

import { GoogleAuthProvider, signInWithCredential, signInWithCustomToken, type User } from 'firebase/auth';
import { auth } from './firebase';
import { getWebUrl } from '@/lib/utils/api-url';
import { agentLog } from '@/lib/debug/agent-log';
import { getNativePlatform } from '@/lib/native/platform';
import { openSystemBrowser } from '@/lib/native/system-browser';

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
let googleAuthCompleted = false;

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

async function finishGoogleAuth(user: User): Promise<void> {
  googleAuthCompleted = true;

  const { Browser } = await import('@capacitor/browser');
  await Browser.close().catch(() => {});

  if (pendingGoogleAuth) {
    const { resolve } = pendingGoogleAuth;
    clearPendingGoogleAuth();
    resolve(user);
  }

  agentLog({
    hypothesisId: 'D',
    location: 'google-auth-native:finish',
    message: 'Google sign-in completed',
    data: { uid: user.uid },
    runId: 'post-fix',
  });
}

async function signInFromDeepLinkTokens(
  idToken: string,
  accessToken: string | null
): Promise<User> {
  const credential = GoogleAuthProvider.credential(
    decodeURIComponent(idToken),
    accessToken ? decodeURIComponent(accessToken) : undefined
  );
  const result = await signInWithCredential(auth, credential);
  return result.user;
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
    data: { hasPending: !!pendingGoogleAuth, alreadyCompleted: googleAuthCompleted },
  });

  if (googleAuthCompleted) {
    return true;
  }

  const parsed = new URL(url.replace('copynpaste://', 'https://local/'));
  const error = parsed.searchParams.get('error');
  const idToken = parsed.searchParams.get('idToken');
  const accessToken = parsed.searchParams.get('accessToken');
  const customToken = parsed.searchParams.get('customToken');

  try {
    if (error) {
      throw new Error(decodeURIComponent(error));
    }

    if (customToken) {
      agentLog({
        hypothesisId: 'G',
        location: 'google-auth-native:deepLink',
        message: 'Signing in with custom token',
        data: {},
        runId: 'post-fix',
      });
      const result = await signInWithCustomToken(auth, decodeURIComponent(customToken));
      await finishGoogleAuth(result.user);
      return true;
    }

    if (!idToken) {
      throw new Error('No se recibió el token de Google');
    }

    const user = await signInFromDeepLinkTokens(idToken, accessToken);
    await finishGoogleAuth(user);
  } catch (authError) {
    if (pendingGoogleAuth) {
      const { reject } = pendingGoogleAuth;
      clearPendingGoogleAuth();
      reject(authError instanceof Error ? authError : new Error('Error de autenticación con Google'));
    } else {
      agentLog({
        hypothesisId: 'D',
        location: 'google-auth-native:deepLink',
        message: 'Deep link error without pending auth',
        data: { error: authError instanceof Error ? authError.message : 'unknown' },
      });
    }
  }

  return true;
}

async function openAuthBrowser(authUrl: string): Promise<'system' | 'in-app'> {
  const platform = await getNativePlatform();

  if (platform === 'ios') {
    agentLog({
      hypothesisId: 'H',
      location: 'google-auth-native:openAuthBrowser',
      message: 'Opening system Safari for Google auth',
      data: { authUrl },
      runId: 'post-fix',
    });
    await openSystemBrowser(authUrl);
    return 'system';
  }

  const { Browser } = await import('@capacitor/browser');
  await Browser.open({
    url: authUrl,
    presentationStyle: 'fullscreen',
  });
  return 'in-app';
}

export async function signInWithGoogleNative(): Promise<User> {
  await registerGoogleAuthDeepLinkListener();
  googleAuthCompleted = false;

  const authSession = Date.now().toString();
  const authUrl = getWebUrl(`/native-google-auth?session=${authSession}`);

  agentLog({
    hypothesisId: 'A',
    location: 'google-auth-native:signIn',
    message: 'Starting Browser Google auth',
    data: {
      origin: typeof window !== 'undefined' ? window.location.origin : 'ssr',
      authUrl,
    },
  });

  return new Promise<User>(async (resolve, reject) => {
    if (pendingGoogleAuth) {
      reject(new Error('Ya hay un inicio de sesión con Google en curso'));
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!pendingGoogleAuth || googleAuthCompleted) return;
      clearPendingGoogleAuth();
      reject(new Error('Tiempo de espera agotado al iniciar sesión con Google'));
    }, AUTH_TIMEOUT_MS);

    pendingGoogleAuth = { resolve, reject, timeoutId };

    try {
      const browserMode = await openAuthBrowser(authUrl);

      if (browserMode === 'in-app') {
        const { Browser } = await import('@capacitor/browser');
        pendingGoogleAuth.browserFinishedListener = await Browser.addListener('browserFinished', () => {
          setTimeout(() => {
            if (googleAuthCompleted || !pendingGoogleAuth) return;

            if (auth.currentUser) {
              agentLog({
                hypothesisId: 'C',
                location: 'google-auth-native:browserFinished',
                message: 'Browser closed after auth already completed',
                data: { uid: auth.currentUser.uid },
                runId: 'post-fix',
              });
              void finishGoogleAuth(auth.currentUser);
              return;
            }

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
      }

      agentLog({
        hypothesisId: 'B',
        location: 'google-auth-native:signIn',
        message: 'Auth browser opened',
        data: { authUrl, browserMode },
      });
    } catch (error) {
      clearPendingGoogleAuth();
      reject(error instanceof Error ? error : new Error('No se pudo abrir el navegador de autenticación'));
    }
  });
}
