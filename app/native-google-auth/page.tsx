'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { agentLog } from '@/lib/debug/agent-log';

const AUTH_FLOW_KEY = 'cnp_native_google_auth';

function redirectToApp(params: { idToken?: string; accessToken?: string; error?: string }) {
  if (params.error) {
    window.location.replace(`copynpaste://auth/callback?error=${encodeURIComponent(params.error)}`);
    return;
  }

  const query = new URLSearchParams();
  if (params.idToken) query.set('idToken', params.idToken);
  if (params.accessToken) query.set('accessToken', params.accessToken);
  window.location.replace(`copynpaste://auth/callback?${query.toString()}`);
}

export default function NativeGoogleAuthPage() {
  const [message, setMessage] = useState('Conectando con Google...');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const flowState = sessionStorage.getItem(AUTH_FLOW_KEY);

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

          sessionStorage.setItem(AUTH_FLOW_KEY, 'done');

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
            hypothesisId: 'F',
            location: 'native-google-auth:stuckRedirect',
            message: 'Returned from Google without redirect result, not restarting loop',
            data: {},
            runId: 'post-fix',
          });
          redirectToApp({ error: 'No se pudo completar el inicio de sesión. Volvé a la app e intentá de nuevo.' });
          return;
        }

        sessionStorage.setItem(AUTH_FLOW_KEY, 'redirecting');

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
        sessionStorage.removeItem(AUTH_FLOW_KEY);
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
