'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { getUserDevices, removeDevice, getDeviceName } from '@/lib/firebase/device-manager';
import type { DeviceInfo } from '@/lib/firebase/device-manager';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PricingPlans from '@/components/features/subscription/pricing-plans';
import SubscriptionModal from '@/components/features/subscription/subscription-modal';

export default function DeviceLimitWarning() {
  const { user, deviceAllowed, currentDeviceId } = useAuth();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

  useEffect(() => {
    const loadDevices = async () => {
      if (!user) return;
      
      try {
        const userDevices = await getUserDevices(user.uid);
        setDevices(userDevices);
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [user]);

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return;
    
    try {
      await removeDevice(user.uid, deviceId);
      
      // Actualizar lista de dispositivos
      const updatedDevices = await getUserDevices(user.uid);
      setDevices(updatedDevices);
      
      // Recargar página para re-evaluar permisos
      window.location.reload();
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return 'Desconocido';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const handleSelectPlan = (plan: 'premium' | 'enterprise') => {
    setSelectedPlan(plan);
    setShowPricing(false);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setShowPricing(false);
  };

  // Si el dispositivo está permitido, no mostrar nada
  if (deviceAllowed) return null;

  // Modal de pricing plans
  if (showPricing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-background dark:bg-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Elige tu Plan</h2>
            <button
              onClick={() => setShowPricing(false)}
              className="p-2 hover:bg-secondary rounded-full text-foreground"
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

      {/* Modal de límite de dispositivos */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            ☕ Límite de Dispositivos Alcanzado
          </h2>
          <p className="text-muted-foreground mb-4">
            Tu plan gratuito permite hasta <strong>2 dispositivos</strong>. 
            Desconecta un dispositivo para continuar o mejora a Premium.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Dispositivos Conectados:</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Cargando dispositivos...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div 
                  key={device.id} 
                  className={`p-3 rounded-lg border ${
                    device.id === currentDeviceId 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700' 
                      : 'border-border bg-muted/50 dark:bg-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{device.deviceName}</span>
                        {device.id === currentDeviceId && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            Dispositivo Actual
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Último uso: {formatLastActive(device.lastActive)}
                      </p>
                    </div>
                    
                    {device.id !== currentDeviceId && (
                      <button
                        onClick={() => handleRemoveDevice(device.id)}
                        className="ml-2 px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 ¿Necesitas más dispositivos?
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Con <strong>Premium</strong> puedes conectar hasta 5 dispositivos por solo el precio de un café al mes.
            </p>
            <button 
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              onClick={() => setShowPricing(true)}
            >
              Ver Planes - Desde $1,000 ARS/mes
            </button>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}


