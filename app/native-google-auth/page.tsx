'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { agentLog } from '@/lib/debug/agent-log';
import { getApiUrl } from '@/lib/utils/api-url';

type CallbackPayload = {
  customToken?: string;
  error?: string;
};

function redirectToApp(params: CallbackPayload) {
  if (params.error) {
    window.location.replace(`copynpaste://auth/callback?error=${encodeURIComponent(params.error)}`);
    return;
  }

  const query = new URLSearchParams();
  if (params.customToken) query.set('customToken', params.customToken);
  window.location.replace(`copynpaste://auth/callback?${query.toString()}`);
}

async function createNativeSessionToken(user: User): Promise<string> {
  const firebaseIdToken = await user.getIdToken();
  const response = await fetch(getApiUrl('/api/auth/native-session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear la sesión (${response.status})`);
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
      try {
        agentLog({
          hypothesisId: 'J',
          location: 'native-google-auth:popup',
          message: 'Starting Google popup auth in external browser',
          data: { userAgent: navigator.userAgent },
          runId: 'post-fix',
        });

        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        agentLog({
          hypothesisId: 'J',
          location: 'native-google-auth:popupSuccess',
          message: 'Google popup auth succeeded',
          data: { uid: result.user.uid },
          runId: 'post-fix',
        });

        setMessage('Volviendo a la app...');

        const customToken = await createNativeSessionToken(result.user);

        agentLog({
          hypothesisId: 'J',
          location: 'native-google-auth:customToken',
          message: 'Custom token created',
          data: { uid: result.user.uid },
          runId: 'post-fix',
        });

        redirectToApp({ customToken });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google';

        agentLog({
          hypothesisId: 'J',
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
