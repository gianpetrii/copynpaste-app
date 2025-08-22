'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, HomeIcon } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    const handleSuccess = async () => {
      // Dar tiempo para que el webhook procese
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refrescar perfil de usuario
      await refreshUserProfile();
      
      setLoading(false);
    };

    handleSuccess();
  }, [refreshUserProfile]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Procesando tu suscripción...</h2>
          <p className="text-gray-600">Esto puede tomar unos segundos.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Suscripción Exitosa! 🎉
          </h1>
          <p className="text-gray-600">
            Tu suscripción ha sido activada correctamente.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">
            ✨ Ya puedes disfrutar de:
          </h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li>• Más dispositivos conectados</li>
            <li>• Mayor almacenamiento</li>
            <li>• Funciones premium</li>
            <li>• Sincronización instantánea</li>
          </ul>
        </div>

        {subscriptionId && (
          <div className="text-xs text-gray-500 mb-6">
            ID de suscripción: {subscriptionId}
          </div>
        )}

        <Button 
          onClick={handleGoHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          Ir a CopyNPaste
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          También recibirás un email de confirmación.
        </p>
      </Card>
    </div>
  );
}
