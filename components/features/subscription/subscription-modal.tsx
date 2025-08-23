'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon, CreditCardIcon, CheckCircleIcon } from 'lucide-react';
import { PLAN_PRICES } from '@/lib/firebase/device-manager';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'premium' | 'enterprise';
}

export default function SubscriptionModal({ isOpen, onClose, selectedPlan }: SubscriptionModalProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const planDetails = {
    premium: {
      name: 'Premium',
      price: PLAN_PRICES.premium,
      features: [
        '5 dispositivos conectados',
        '500 elementos guardados',
        '2 GB de almacenamiento',
        'Búsqueda avanzada con filtros',
        'Organización por carpetas',
        'Backup automático',
        'Sincronización instantánea'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: PLAN_PRICES.enterprise,
      features: [
        'Dispositivos ilimitados',
        'Elementos ilimitados',
        'Almacenamiento ilimitado',
        'Compartir con equipo',
        'Controles de privacidad avanzados',
        'Analytics detallados',
        'Soporte prioritario 24/7',
        'Integración con APIs'
      ]
    }
  };

  const plan = planDetails[selectedPlan];

  const handleSubscribe = async () => {
    if (!user) {
      setError('Debes estar logueado para suscribirte');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          plan: selectedPlan
        })
      });

      const data = await response.json();

      if (data.success && data.initPoint) {
        // Redireccionar a MercadoPago
        window.location.href = data.initPoint;
      } else {
        setError(data.error || 'Error creando suscripción');
      }
    } catch (error) {
      console.error('Error creando suscripción:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')} ARS`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4" style={{ backdropFilter: 'none' }}>
      <Card className="max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Suscripción {plan.name}</h2>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            variant="ghost"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(plan.price)}
            </span>
            <span className="text-gray-500 text-lg">/mes</span>
          </div>
          <p className="text-sm text-gray-600">
            Precio de un café premium ☕ • Cancela cuando quieras
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">✨ Todo lo que incluye:</h3>
          <div className="space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            {loading ? 'Procesando...' : `Suscribirme por ${formatPrice(plan.price)}/mes`}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">🔒 Pago 100% Seguro</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Procesado por MercadoPago (certificado PCI DSS)</p>
            <p>• Aceptamos tarjetas de crédito y débito</p>
            <p>• También transferencias bancarias</p>
            <p>• Facturación automática mensual</p>
            <p>• Cancela en cualquier momento</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Al continuar aceptas nuestros{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}


