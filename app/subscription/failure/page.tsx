'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircleIcon, HomeIcon, RefreshCwIcon } from 'lucide-react';

export default function SubscriptionFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subscriptionId = searchParams.get('subscription_id');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error en el Pago
          </h1>
          <p className="text-gray-600">
            No pudimos procesar tu suscripción. No se realizó ningún cargo.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">
            Posibles causas:
          </h3>
          <ul className="text-sm text-red-700 space-y-1 text-left">
            <li>• Fondos insuficientes</li>
            <li>• Tarjeta expirada o bloqueada</li>
            <li>• Error de conectividad</li>
            <li>• Límites de la tarjeta</li>
          </ul>
        </div>

        {subscriptionId && (
          <div className="text-xs text-gray-500 mb-6">
            Referencia: {subscriptionId}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleTryAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Intentar Nuevamente
          </Button>

          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">💡 Consejos:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Verifica los datos de tu tarjeta</p>
            <p>• Asegúrate de tener fondos suficientes</p>
            <p>• Intenta con otra tarjeta si persiste</p>
            <p>• Contacta a tu banco si es necesario</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Si el problema persiste, contáctanos para ayudarte.
        </p>
      </Card>
    </div>
  );
}
