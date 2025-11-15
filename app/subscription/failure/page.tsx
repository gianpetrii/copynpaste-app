'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, Loader } from 'lucide-react';

function SubscriptionFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const subscriptionId = searchParams.get('subscription_id');
  const reason = searchParams.get('reason') || 'Error de pago';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Error en el Pago
        </h1>
        <p className="text-muted-foreground mb-4">
          No pudimos procesar tu suscripción. Esto puede deberse a:
        </p>
        <ul className="text-left text-sm text-muted-foreground mb-6 space-y-1">
          <li>• Fondos insuficientes</li>
          <li>• Problema con la tarjeta</li>
          <li>• Pago cancelado</li>
          <li>• Error temporal del sistema</li>
        </ul>
        <div className="space-y-2">
          <Button onClick={() => router.push('/')} className="w-full">
            Intentar nuevamente
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/contact')} 
            className="w-full"
          >
            Contactar soporte
          </Button>
        </div>
        {subscriptionId && (
          <p className="text-xs text-muted-foreground mt-4">
            ID de referencia: {subscriptionId}
          </p>
        )}
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

export default function SubscriptionFailure() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionFailureContent />
    </Suspense>
  );
}