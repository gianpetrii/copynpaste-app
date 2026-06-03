'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { PLAN_PRICES, PLAN_LIMITS } from '@/lib/firebase/device-manager';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: 'premium' | 'enterprise') => void;
  loading?: boolean;
}

export default function PricingPlans({ onSelectPlan, loading = false }: PricingPlansProps) {
  const { userProfile } = useAuth();
  const currentPlan = userProfile?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      description: 'Perfecto para uso personal básico',
      badge: null,
      features: [
        { text: '2 dispositivos', included: true },
        { text: '25 elementos guardados', included: true },
        { text: '50 MB de almacenamiento', included: true },
        { text: 'Sincronización básica', included: true },
        { text: 'Búsqueda avanzada', included: false },
        { text: 'Organización por carpetas', included: false },
        { text: 'Backup automático', included: false },
        { text: 'Soporte prioritario', included: false }
      ],
      action: null
    },
    {
      id: 'premium',
      name: 'Premium',
      price: PLAN_PRICES.premium,
      description: 'Lo que necesitas para ser más productivo',
      badge: 'Más Popular',
      badgeColor: 'bg-blue-600',
      features: [
        { text: '5 dispositivos', included: true },
        { text: '500 elementos guardados', included: true },
        { text: '2 GB de almacenamiento', included: true },
        { text: 'Sincronización instantánea', included: true },
        { text: 'Búsqueda avanzada con filtros', included: true },
        { text: 'Organización por carpetas/tags', included: true },
        { text: 'Backup automático', included: true },
        { text: 'Personalización de interfaz', included: true },
        { text: 'Soporte prioritario', included: false }
      ],
      action: () => onSelectPlan('premium')
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: PLAN_PRICES.enterprise,
      description: 'Para equipos y pequeñas empresas',
      badge: 'Equipos',
      badgeColor: 'bg-purple-600',
      features: [
        { text: 'Dispositivos ilimitados', included: true },
        { text: 'Elementos ilimitados', included: true },
        { text: 'Almacenamiento ilimitado', included: true },
        { text: 'Todas las funciones Premium', included: true },
        { text: 'Compartir con equipo', included: true },
        { text: 'Controles de privacidad avanzados', included: true },
        { text: 'Analytics detallados', included: true },
        { text: 'Soporte prioritario 24/7', included: true },
        { text: 'Integración con APIs', included: true }
      ],
      action: () => onSelectPlan('enterprise')
    }
  ];

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `$${price.toLocaleString('es-AR')} ARS`;
  };

  const getButtonText = (planId: string) => {
    if (planId === 'free') return 'Plan Actual';
    if (currentPlan === planId) return 'Plan Actual';
    if (currentPlan === 'free') return 'Upgrade';
    return 'Cambiar Plan';
  };

  const isCurrentPlan = (planId: string) => currentPlan === planId;
  const isDowngrade = (planId: string) => {
    const planOrder = { 'free': 0, 'premium': 1, 'enterprise': 2 };
    return planOrder[currentPlan as keyof typeof planOrder] > planOrder[planId as keyof typeof planOrder];
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative p-6 ${
          plan.id === 'premium' ? 'border-blue-500 border-2 md:scale-105' : 'border-border'
        } ${isCurrentPlan(plan.id) ? 'bg-green-500/10 border-green-500/30' : ''}`}>
          
          {plan.badge && (
            <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white`}>
              {plan.badge}
            </Badge>
          )}

          {isCurrentPlan(plan.id) && (
            <Badge className="absolute -top-3 right-4 bg-green-600 text-white">
              Plan Actual
            </Badge>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
            
            <div className="mb-2">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(plan.price)}
              </span>
              {plan.price > 0 && (
                <span className="text-muted-foreground text-lg">/mes</span>
              )}
            </div>
            
            {plan.price > 0 && (
              <p className="text-sm text-muted-foreground">
                ~$2.50 USD • Precio de un café ☕
              </p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                {feature.included ? (
                  <CheckIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                ) : (
                  <XIcon className="h-5 w-5 text-muted-foreground/40 mr-3 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  feature.included ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            {plan.action ? (
              <Button
                onClick={plan.action}
                disabled={loading || isCurrentPlan(plan.id)}
                className={`w-full ${
                  plan.id === 'premium' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {loading ? 'Procesando...' : getButtonText(plan.id)}
              </Button>
            ) : (
              <Button
                disabled
                variant="secondary"
                className="w-full cursor-not-allowed"
              >
                {getButtonText(plan.id)}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}


