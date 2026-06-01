'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { agentLog } from '@/lib/debug/agent-log';

function redirectToApp(params: { idToken?: string; accessToken?: string; error?: string }) {
  if (params.error) {
    window.location.href = `copynpaste://auth/callback?error=${encodeURIComponent(params.error)}`;
    return;
  }

  const query = new URLSearchParams();
  if (params.idToken) query.set('idToken', params.idToken);
  if (params.accessToken) query.set('accessToken', params.accessToken);
  window.location.href = `copynpaste://auth/callback?${query.toString()}`;
}

export default function NativeGoogleAuthPage() {
  const [message, setMessage] = useState('Conectando con Google...');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:run',
          message: 'Checking redirect result',
          data: {},
        });

        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
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

          setMessage('Volviendo a la app...');
          redirectToApp({
            idToken: googleIdToken,
            accessToken: googleAccessToken ?? undefined,
          });
          return;
        }

        agentLog({
          hypothesisId: 'E',
          location: 'native-google-auth:signInWithRedirect',
          message: 'Starting Google redirect (popup blocked in SFSafariViewController)',
          data: {},
          runId: 'post-fix',
        });

        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (error) {
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
