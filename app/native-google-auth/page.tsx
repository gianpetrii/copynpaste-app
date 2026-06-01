'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  type Auth,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { agentLog } from '@/lib/debug/agent-log';
import { getApiUrl } from '@/lib/utils/api-url';

const SESSION_ID_KEY = 'cnp_auth_session_id';

type CallbackPayload = {
  idToken?: string;
  accessToken?: string;
  customToken?: string;
  error?: string;
};

function getSessionId(): string {
  if (typeof window === 'undefined') return 'default';

  const fromUrl = new URLSearchParams(window.location.search).get('session');
  if (fromUrl) {
    sessionStorage.setItem(SESSION_ID_KEY, fromUrl);
    return fromUrl;
  }

  return sessionStorage.getItem(SESSION_ID_KEY) ?? 'default';
}

function getAuthFlowKey(): string {
  return `cnp_native_google_auth_${getSessionId()}`;
}

function saveCallbackPayload(authFlowKey: string, payload: CallbackPayload) {
  sessionStorage.setItem(`${authFlowKey}_payload`, JSON.stringify(payload));
}

function loadCallbackPayload(authFlowKey: string): CallbackPayload | null {
  const raw = sessionStorage.getItem(`${authFlowKey}_payload`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CallbackPayload;
  } catch {
    return null;
  }
}

function redirectToApp(authFlowKey: string, params: CallbackPayload) {
  saveCallbackPayload(authFlowKey, params);
  sessionStorage.setItem(authFlowKey, 'done');

  if (params.error) {
    window.location.replace(`copynpaste://auth/callback?error=${encodeURIComponent(params.error)}`);
    return;
  }

  const query = new URLSearchParams();
  if (params.idToken) query.set('idToken', params.idToken);
  if (params.accessToken) query.set('accessToken', params.accessToken);
  if (params.customToken) query.set('customToken', params.customToken);
  window.location.replace(`copynpaste://auth/callback?${query.toString()}`);
}

function waitForAuthUser(authInstance: Auth, timeoutMs: number): Promise<User | null> {
  return new Promise((resolve) => {
    if (authInstance.currentUser) {
      resolve(authInstance.currentUser);
      return;
    }

    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(authInstance.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(user);
      }
    });
  });
}

async function createNativeSessionToken(user: User): Promise<string> {
  const firebaseIdToken = await user.getIdToken();
  const response = await fetch(getApiUrl('/api/auth/native-session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear la sesión para la app (${response.status})`);
  }

  const data = (await response.json()) as { customToken?: string };
  if (!data.customToken) {
    throw new Error('Respuesta de sesión inválida');
  }

  return data.customToken;
}

async function completeWithCustomToken(authFlowKey: string, user: User): Promise<void> {
  const customToken = await createNativeSessionToken(user);

  agentLog({
    hypothesisId: 'G',
    location: 'native-google-auth:customToken',
    message: 'Custom token created for native app',
    data: { uid: user.uid },
    runId: 'post-fix',
  });

  redirectToApp(authFlowKey, { customToken });
}

async function completeWithRedirectResult(authFlowKey: string): Promise<boolean> {
  const redirectResult = await getRedirectResult(auth);

  if (!redirectResult?.user) {
    return false;
  }

  const credential = GoogleAuthProvider.credentialFromResult(redirectResult);
  const googleIdToken = credential?.idToken;
  const googleAccessToken = credential?.accessToken;

  if (!googleIdToken) {
    throw new Error('No se obtuvo credencial de Google');
  }

  agentLog({
    hypothesisId: 'E',
    location: 'native-google-auth:redirectResult',
    message: 'Redirect result received',
    data: { uid: redirectResult.user.uid, hasAccessToken: !!googleAccessToken },
    runId: 'post-fix',
  });

  redirectToApp(authFlowKey, {
    idToken: googleIdToken,
    accessToken: googleAccessToken ?? undefined,
  });

  return true;
}

export default function NativeGoogleAuthPage() {
  const [message, setMessage] = useState('Conectando con Google...');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const authFlowKey = getAuthFlowKey();

      try {
        const flowState = sessionStorage.getItem(authFlowKey);

        if (flowState === 'done') {
          setMessage('Volviendo a la app...');
          const savedPayload = loadCallbackPayload(authFlowKey);
          if (savedPayload && !savedPayload.error) {
            agentLog({
              hypothesisId: 'I',
              location: 'native-google-auth:retryCallback',
              message: 'Retrying deep link callback',
              data: { hasCustomToken: !!savedPayload.customToken },
              runId: 'post-fix',
            });
            redirectToApp(authFlowKey, savedPayload);
          }
          return;
        }

        await auth.authStateReady();

        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:run',
          message: 'Checking redirect result',
          data: {
            flowState,
            hasCurrentUser: !!auth.currentUser,
          },
        });

        if (await completeWithRedirectResult(authFlowKey)) {
          setMessage('Volviendo a la app...');
          return;
        }

        if (auth.currentUser) {
          setMessage('Volviendo a la app...');
          agentLog({
            hypothesisId: 'G',
            location: 'native-google-auth:currentUser',
            message: 'Using currentUser for custom token',
            data: { uid: auth.currentUser.uid },
            runId: 'post-fix',
          });
          await completeWithCustomToken(authFlowKey, auth.currentUser);
          return;
        }

        if (flowState === 'redirecting') {
          setMessage('Volviendo a la app...');

          agentLog({
            hypothesisId: 'G',
            location: 'native-google-auth:fallback',
            message: 'Waiting for auth user after redirect',
            data: {},
            runId: 'post-fix',
          });

          const user = await waitForAuthUser(auth, 20000);

          if (user) {
            await completeWithCustomToken(authFlowKey, user);
            return;
          }

          throw new Error('No se pudo completar el inicio de sesión (sin sesión Firebase)');
        }

        sessionStorage.setItem(authFlowKey, 'redirecting');

        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:signInWithRedirect',
          message: 'Starting Google redirect',
          data: {},
          runId: 'post-fix',
        });

        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (error) {
        sessionStorage.removeItem(authFlowKey);
        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google';

        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:error',
          message: 'Google auth failed',
          data: { error: errorMessage },
        });

        redirectToApp(authFlowKey, { error: errorMessage });
      }
    };

    void run();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
