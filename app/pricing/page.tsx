'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import PricingPlans from '@/components/features/subscription/pricing-plans';
import SubscriptionModal from '@/components/features/subscription/subscription-modal';
import SubscriptionManager from '@/components/features/subscription/subscription-manager';

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el Plan Perfecto para Ti
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mejora tu productividad con CopyNPaste Premium. 
            Planes diseñados para el mercado argentino.
          </p>
        </div>

        {/* User's Current Subscription */}
        {user && userProfile && userProfile.plan !== 'free' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Mi Suscripción Actual</h2>
            <div className="max-w-2xl mx-auto">
              <SubscriptionManager />
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-12">
          <PricingPlans onSelectPlan={handleSelectPlan} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Preguntas Frecuentes</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes cancelar tu suscripción cuando quieras. Seguirás teniendo acceso 
                hasta el final del período que ya pagaste.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-600 text-sm">
                Aceptamos tarjetas de crédito, débito y transferencias bancarias a través de MercadoPago. 
                Todo procesado de forma segura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">¿Mis datos están seguros?</h3>
              <p className="text-gray-600 text-sm">
                Absolutamente. Usamos Firebase (Google) para almacenamiento y MercadoPago para pagos, 
                ambos con certificaciones de seguridad internacionales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">¿Hay descuentos por pago anual?</h3>
              <p className="text-gray-600 text-sm">
                Por ahora solo ofrecemos suscripciones mensuales. Pronto agregaremos opciones anuales 
                con descuentos especiales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">¿Puedo cambiar de plan después?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes cambiar entre Premium y Enterprise en cualquier momento. 
                Los cambios se aplicarán en tu próximo período de facturación.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">¿Tienes más preguntas?</h3>
          <p className="text-gray-600 mb-4">
            Estamos aquí para ayudarte a elegir el mejor plan para tus necesidades.
          </p>
          <p className="text-sm text-gray-500">
            Contactanos: support@copynpaste.app
          </p>
        </div>
      </div>

      {/* Subscription Modal */}
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
