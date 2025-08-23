'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { getUserSubscription, cancelSubscription } from '@/lib/firebase/subscription-manager';
import type { Subscription } from '@/lib/firebase/subscription-manager';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCardIcon, CalendarIcon, XCircleIcon, CheckCircleIcon } from 'lucide-react';
import { PLAN_PRICES } from '@/lib/firebase/device-manager';

export default function SubscriptionManager() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      
      try {
        const userSubscription = await getUserSubscription(user.uid);
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setCancelling(true);
    
    try {
      const success = await cancelSubscription(subscription.id, 'Cancelación solicitada por usuario');
      
      if (success) {
        await refreshUserProfile();
        setSubscription(null);
        alert('Suscripción cancelada exitosamente');
      } else {
        alert('Error cancelando suscripción. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelando suscripción. Intenta nuevamente.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No disponible';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')} ARS`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'cancelled':
        return 'Cancelada';
      case 'pending':
        return 'Pendiente';
      case 'past_due':
        return 'Pago Vencido';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!userProfile || userProfile.plan === 'free') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Plan Gratuito</h3>
          <p className="text-gray-600 mb-4">Estás usando el plan gratuito de CopyNPaste.</p>
          <p className="text-sm text-gray-500">Mejora a Premium para acceder a más funciones.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Mi Suscripción</h3>
        {subscription && (
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusText(subscription.status)}
          </Badge>
        )}
      </div>

      {subscription ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Plan</label>
              <p className="text-lg font-semibold capitalize">{subscription.plan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Precio</label>
              <p className="text-lg font-semibold">{formatPrice(subscription.amount)}/mes</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label className="text-sm font-medium text-gray-500">Inicio</label>
                <p className="text-sm">{formatDate(subscription.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <label className="text-sm font-medium text-gray-500">Próxima facturación</label>
                <p className="text-sm">{formatDate(subscription.nextBillingDate)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium">Método de pago</p>
              <p className="text-sm text-gray-600">MercadoPago • Renovación automática</p>
            </div>
          </div>

          {subscription.status === 'active' && (
            <div className="pt-4 border-t">
              <Button onClick={handleCancelSubscription} disabled={cancelling} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircleIcon className="h-4 w-4 mr-2" />
                {cancelling ? 'Cancelando...' : 'Cancelar Suscripción'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">Tu suscripción seguirá activa hasta el final del período actual.</p>
            </div>
          )}

          {subscription.status === 'cancelled' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Suscripción cancelada</p>
                  <p className="text-xs text-yellow-600">Tendrás acceso hasta: {formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">No se encontró información de suscripción.</p>
        </div>
      )}
    </Card>
  );
}


