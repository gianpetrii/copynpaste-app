'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangleIcon, 
  XIcon, 
  TrashIcon, 
  CheckCircleIcon,
  LoaderIcon,
  FileTextIcon,
  SmartphoneIcon,
  CreditCardIcon,
  HardDriveIcon
} from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DataSummary {
  totalItems: number;
  totalDevices: number;
  totalSubscriptions: number;
  totalPayments: number;
  totalFileSize: number;
  totalFileSizeMB: number;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'warning' | 'summary' | 'confirm' | 'deleting' | 'completed'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [deletionResult, setDeletionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user && step === 'summary') {
      loadDataSummary();
    }
  }, [isOpen, user, step]);

  const loadDataSummary = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/account/delete?userId=${user.uid}`);
      const data = await response.json();
      
      if (response.ok) {
        setDataSummary(data);
      } else {
        setError(data.error || 'Error cargando datos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || confirmationText !== 'ELIMINAR MI CUENTA') {
      setError('Debes escribir exactamente "ELIMINAR MI CUENTA"');
      return;
    }

    setStep('deleting');
    setError('');

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          },
          confirmationText
        })
      });

      const result = await response.json();

      if (response.ok) {
        setDeletionResult(result);
        setStep('completed');
        
        // Cerrar modal después de 5 segundos
        setTimeout(() => {
          // El usuario será deslogueado automáticamente por Firebase
          window.location.href = '/';
        }, 5000);
      } else {
        setError(result.error || 'Error eliminando cuenta');
        setStep('confirm');
      }
    } catch (error) {
      setError('Error de conexión');
      setStep('confirm');
    }
  };

  const handleClose = () => {
    if (step !== 'deleting') {
      setStep('warning');
      setConfirmationText('');
      setError('');
      setDataSummary(null);
      setDeletionResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Eliminar Cuenta
            </h2>
          </div>
          {step !== 'deleting' && (
            <Button onClick={handleClose} variant="ghost" className="p-2">
              <XIcon className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: Warning */}
          {step === 'warning' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  ⚠️ Esta acción es permanente e irreversible
                </h3>
                <p className="text-red-700 text-sm">
                  Al eliminar tu cuenta se borrará completamente:
                </p>
                <ul className="text-red-700 text-sm mt-2 space-y-1">
                  <li>• Todos tus elementos guardados (textos, URLs, archivos)</li>
                  <li>• Tu suscripción activa (se cancelará automáticamente)</li>
                  <li>• Historial de pagos y facturación</li>
                  <li>• Dispositivos conectados</li>
                  <li>• Tu perfil y configuraciones</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  💡 Alternativas
                </h4>
                <p className="text-yellow-700 text-sm">
                  Si solo quieres pausar tu suscripción, puedes hacerlo desde la página de Planes 
                  sin perder tus datos.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setStep('summary')} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continuar con Eliminación
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Data Summary */}
          {step === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Resumen de datos a eliminar
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2">Cargando datos...</span>
                  </div>
                ) : dataSummary ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Elementos</span>
                      </div>
                      <p className="text-2xl font-bold">{dataSummary.totalItems}</p>
                      <p className="text-sm text-gray-600">
                        {dataSummary.totalFileSizeMB} MB en archivos
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <SmartphoneIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Dispositivos</span>
                      </div>
                      <p className="text-2xl font-bold">{dataSummary.totalDevices}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCardIcon className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Suscripciones</span>
                      </div>
                      <p className="text-2xl font-bold">{dataSummary.totalSubscriptions}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDriveIcon className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Pagos</span>
                      </div>
                      <p className="text-2xl font-bold">{dataSummary.totalPayments}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-red-600">
                    Error cargando datos. {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep('warning')} variant="outline" className="flex-1">
                  Volver
                </Button>
                <Button 
                  onClick={() => setStep('confirm')} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading || !dataSummary}
                >
                  Proceder a Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Final Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  🔴 Confirmación Final
                </h3>
                <p className="text-red-700 text-sm mb-4">
                  Para confirmar que entiendes que esta acción es irreversible, 
                  escribe exactamente el siguiente texto:
                </p>
                <p className="font-mono bg-red-100 p-2 rounded text-red-800 text-center">
                  ELIMINAR MI CUENTA
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribir texto de confirmación:
                </label>
                <Input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="ELIMINAR MI CUENTA"
                  className="w-full"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setStep('summary')} variant="outline" className="flex-1">
                  Volver
                </Button>
                <Button 
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={confirmationText !== 'ELIMINAR MI CUENTA'}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar Cuenta Permanentemente
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Deleting */}
          {step === 'deleting' && (
            <div className="text-center py-12">
              <LoaderIcon className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Eliminando cuenta...</h3>
              <p className="text-gray-600">
                Por favor espera mientras eliminamos todos tus datos.
                Este proceso puede tardar unos minutos.
              </p>
            </div>
          )}

          {/* Step 5: Completed */}
          {step === 'completed' && (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cuenta eliminada exitosamente</h3>
              
              {deletionResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Datos eliminados:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• {deletionResult.deletedItems.items} elementos</p>
                    <p>• {deletionResult.deletedItems.files} archivos</p>
                    <p>• {deletionResult.deletedItems.devices} dispositivos</p>
                    <p>• {deletionResult.deletedItems.subscriptions} suscripciones</p>
                    <p>• {deletionResult.deletedItems.payments} registros de pago</p>
                  </div>
                  
                  {deletionResult.errors.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded">
                      <p className="text-yellow-800 text-sm">
                        Algunos elementos no se pudieron eliminar: {deletionResult.errors.length} errores
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-600">
                Serás redirigido automáticamente en unos segundos...
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
