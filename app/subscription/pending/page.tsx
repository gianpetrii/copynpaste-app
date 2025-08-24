'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, Loader } from 'lucide-react';

export default function SubscriptionPending() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const subscriptionId = searchParams.get('subscription_id');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="relative mb-4">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto" />
          <Loader className="h-6 w-6 text-yellow-600 absolute -bottom-1 -right-1 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-yellow-600 mb-2">
          Pago Pendiente
        </h1>
        <p className="text-muted-foreground mb-4">
          Tu pago está siendo procesado. Esto puede tomar unos minutos.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>¿Qué hacer ahora?</strong>
          </p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• Recibirás un email de confirmación</li>
            <li>• No cierres esta ventana</li>
            <li>• El proceso puede tomar hasta 15 minutos</li>
          </ul>
        </div>
        <div className="space-y-2">
          <Button onClick={() => router.push('/')} className="w-full">
            Volver a la aplicación
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Verificar estado
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
