'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getApiUrl, getWebUrl } from '@/lib/utils/api-url';
import { openExternalUrl, isNativePlatform } from '@/lib/native/platform';
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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
        'Sincronización instantánea',
      ],
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
        'Integración con APIs',
      ],
    },
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
      const native = await isNativePlatform();

      if (native) {
        await openExternalUrl(getWebUrl(`/pricing?plan=${selectedPlan}`));
        onClose();
        return;
      }

      const response = await fetch(getApiUrl('/api/mercadopago/create-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.success && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setError(data.error || 'Error creando suscripción');
      }
    } catch (err) {
      console.error('Error creando suscripción:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')} ARS`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Suscripción {plan.name}</h2>
          <Button onClick={onClose} className="p-2 rounded-full" variant="ghost">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
            <span className="text-muted-foreground text-lg">/mes</span>
          </div>
          <p className="text-sm text-muted-foreground">Precio de un café premium ☕ • Cancela cuando quieras</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-foreground">✨ Todo lo que incluye:</h3>
          <div className="space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            {loading ? 'Procesando...' : `Continuar con ${formatPrice(plan.price)}/mes`}
          </Button>

          <Button onClick={onClose} variant="outline" className="w-full" disabled={loading}>
            Cancelar
          </Button>
        </div>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h4 className="font-semibold text-sm mb-2 text-foreground">🔒 Pago 100% Seguro</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Procesado por MercadoPago (certificado PCI DSS)</p>
            <p>• Aceptamos tarjetas de crédito y débito</p>
            <p>• También transferencias bancarias</p>
            <p>• Facturación automática mensual</p>
            <p>• Cancela en cualquier momento</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
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
    </div>,
    document.body
  );
}
