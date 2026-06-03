'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import PricingPlans from '@/components/features/subscription/pricing-plans';
import SubscriptionModal from '@/components/features/subscription/subscription-modal';
import { AppNavbar } from '@/components/app-navbar';

export default function PricingPageContent() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if ((planParam === 'premium' || planParam === 'enterprise') && user) {
      setSelectedPlan(planParam);
    }
  }, [searchParams, user]);

  const handleSelectPlan = (plan: 'premium' | 'enterprise') => {
    if (!user) {
      alert('Debes iniciar sesión para suscribirte');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AppNavbar />

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Elige el Plan Perfecto para Ti
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Mejora tu productividad con CopyNPaste Premium.
            Planes diseñados para el mercado argentino.
          </p>
        </div>

        <div className="mb-12">
          <PricingPlans onSelectPlan={handleSelectPlan} />
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center text-foreground">Preguntas Frecuentes</h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Puedo cancelar en cualquier momento?',
                a: 'Sí, puedes cancelar tu suscripción cuando quieras. Seguirás teniendo acceso hasta el final del período que ya pagaste.',
              },
              {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos tarjetas de crédito, débito y transferencias bancarias a través de MercadoPago. Todo procesado de forma segura.',
              },
              {
                q: '¿Mis datos están seguros?',
                a: 'Absolutamente. Usamos Firebase (Google) para almacenamiento y MercadoPago para pagos, ambos con certificaciones de seguridad internacionales.',
              },
              {
                q: '¿Hay descuentos por pago anual?',
                a: 'Por ahora solo ofrecemos suscripciones mensuales. Pronto agregaremos opciones anuales con descuentos especiales.',
              },
              {
                q: '¿Puedo cambiar de plan después?',
                a: 'Sí, puedes cambiar entre Premium y Enterprise en cualquier momento. Los cambios se aplicarán en tu próximo período de facturación.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-foreground">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 p-8 bg-card border border-border rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-foreground">¿Tienes más preguntas?</h3>
          <p className="text-muted-foreground mb-4">
            Estamos aquí para ayudarte a elegir el mejor plan para tus necesidades.
          </p>
          <p className="text-sm text-muted-foreground">Contactanos: support@copynpaste.app</p>
        </div>
      </div>

      {selectedPlan && (
        <SubscriptionModal
          isOpen={!!selectedPlan}
          onClose={handleCloseModal}
          selectedPlan={selectedPlan}
        />
      )}
    </div>
  );
}
