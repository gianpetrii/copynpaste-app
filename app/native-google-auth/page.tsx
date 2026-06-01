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

function getAuthFlowKey(): string {
  const sessionId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('session') ?? 'default'
      : 'default';
  return `cnp_native_google_auth_${sessionId}`;
}

function redirectToApp(params: {
  idToken?: string;
  accessToken?: string;
  customToken?: string;
  error?: string;
}) {
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
    throw new Error('No se pudo crear la sesión para la app');
  }

  const data = (await response.json()) as { customToken?: string };
  if (!data.customToken) {
    throw new Error('Respuesta de sesión inválida');
  }

  return data.customToken;
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
          agentLog({
            hypothesisId: 'F',
            location: 'native-google-auth:alreadyDone',
            message: 'Auth flow already completed, skipping redirect',
            data: {},
            runId: 'post-fix',
          });
          return;
        }

        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:run',
          message: 'Checking redirect result',
          data: { flowState },
        });

        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          const credential = GoogleAuthProvider.credentialFromResult(redirectResult);
          const googleIdToken = credential?.idToken;
          const googleAccessToken = credential?.accessToken;

          if (!googleIdToken) {
            throw new Error('No se obtuvo credencial de Google');
          }

          sessionStorage.setItem(authFlowKey, 'done');

          agentLog({
            hypothesisId: 'E',
            location: 'native-google-auth:redirectResult',
            message: 'Redirect result received',
            data: { uid: redirectResult.user.uid, hasAccessToken: !!googleAccessToken },
            runId: 'post-fix',
          });

          setMessage('Volviendo a la app...');
          redirectToApp({
            idToken: googleIdToken,
            accessToken: googleAccessToken ?? undefined,
          });
          return;
        }

        if (flowState === 'redirecting') {
          setMessage('Volviendo a la app...');

          agentLog({
            hypothesisId: 'G',
            location: 'native-google-auth:fallback',
            message: 'No redirect result, waiting for auth user for custom token',
            data: {},
            runId: 'post-fix',
          });

          const user = await waitForAuthUser(auth, 8000);

          if (user) {
            const customToken = await createNativeSessionToken(user);
            sessionStorage.setItem(authFlowKey, 'done');

            agentLog({
              hypothesisId: 'G',
              location: 'native-google-auth:customToken',
              message: 'Custom token created for native app',
              data: { uid: user.uid },
              runId: 'post-fix',
            });

            redirectToApp({ customToken });
            return;
          }

          throw new Error('No se pudo completar el inicio de sesión');
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

        redirectToApp({ error: errorMessage });
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
