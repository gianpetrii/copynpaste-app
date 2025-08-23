'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { PLAN_LIMITS, PLAN_PRICES } from '@/lib/firebase/device-manager';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon, AlertTriangleIcon, TrendingUpIcon } from 'lucide-react';
import PricingPlans from '@/components/features/subscription/pricing-plans';
import SubscriptionModal from '@/components/features/subscription/subscription-modal';

interface ItemLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItemCount: number;
}

export default function ItemLimitModal({ isOpen, onClose, currentItemCount }: ItemLimitModalProps) {
  const { userProfile } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

  if (!isOpen) return null;

  const currentPlan = userProfile?.plan || 'free';
  const planLimits = PLAN_LIMITS[currentPlan];

  const handleSelectPlan = (plan: 'premium' | 'enterprise') => {
    setSelectedPlan(plan);
    setShowPricing(false);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setShowPricing(false);
    onClose();
  };

  // Modal de pricing plans
  if (showPricing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4" style={{ backdropFilter: 'none' }}>
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Elige tu Plan</h2>
            <button
              onClick={() => setShowPricing(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <PricingPlans onSelectPlan={handleSelectPlan} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de suscripción */}
      {selectedPlan && (
        <SubscriptionModal
          isOpen={!!selectedPlan}
          onClose={handleCloseModal}
          selectedPlan={selectedPlan}
        />
      )}

      {/* Modal de límite alcanzado */}
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4" style={{ backdropFilter: 'none' }}>
        <Card className="max-w-md w-full p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Límite Alcanzado
              </h2>
            </div>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              variant="ghost"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                Has alcanzado el límite de tu plan gratuito
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {currentItemCount}/{planLimits.maxItems} elementos guardados
              </p>
            </div>

            <p className="text-gray-600">
              Para seguir guardando elementos, necesitas hacer upgrade a Premium.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                🚀 Con Premium tendrás:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• <strong>500 elementos</strong> guardados</li>
                <li>• <strong>5 dispositivos</strong> conectados</li>
                <li>• <strong>2 GB</strong> de almacenamiento</li>
                <li>• Búsqueda avanzada con filtros</li>
                <li>• Organización por carpetas</li>
                <li>• Backup automático</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                $1,000 ARS/mes
              </p>
              <p className="text-sm text-gray-500">
                El precio de un café ☕ • Cancela cuando quieras
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowPricing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Ver Planes y Hacer Upgrade
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cerrar por Ahora
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              También puedes eliminar elementos antiguos para hacer espacio
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}


