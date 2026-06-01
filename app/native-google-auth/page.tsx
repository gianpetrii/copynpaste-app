'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

export default function NativeGoogleAuthPage() {
  const [message, setMessage] = useState('Conectando con Google...');

  useEffect(() => {
    const run = async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        setMessage('Volviendo a la app...');
        window.location.href = `copynpaste://auth/callback?idToken=${encodeURIComponent(idToken)}`;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google';
        window.location.href = `copynpaste://auth/callback?error=${encodeURIComponent(errorMessage)}`;
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
