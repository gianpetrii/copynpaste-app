'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { activateSubscription } from '@/lib/firebase/subscription-manager';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    const processSuccess = async () => {
      if (!user || !subscriptionId) {
        setError('Información de suscripción incompleta');
        setLoading(false);
        return;
      }

      try {
        // Activar la suscripción en Firestore
        await activateSubscription(user.uid, subscriptionId);
        setLoading(false);
      } catch (error) {
        console.error('Error activando suscripción:', error);
        setError('Error al activar la suscripción');
        setLoading(false);
      }
    };

    processSuccess();
  }, [user, subscriptionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Procesando tu suscripción...</h1>
          <p className="text-muted-foreground mt-2">
            Por favor espera mientras confirmamos tu pago.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p className="text-muted-foreground mt-2 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          ¡Suscripción Exitosa!
        </h1>
        <p className="text-muted-foreground mb-6">
          Tu suscripción ha sido activada correctamente. Ahora puedes disfrutar de todas las funcionalidades premium.
        </p>
        <Button onClick={() => router.push('/')}>
          Ir a la aplicación
        </Button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}