'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserIcon, 
  SettingsIcon, 
  TrashIcon, 
  CrownIcon,
  SmartphoneIcon,
  CalendarIcon,
  MailIcon
} from 'lucide-react';
import Link from 'next/link';
import DeleteAccountModal from '@/app/components/account/delete-account-modal';
import SubscriptionManager from '@/app/components/subscription/subscription-manager';

export default function AccountPage() {
  const { user, userProfile } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para acceder a la configuración de tu cuenta.
          </p>
          <Link href="/">
            <Button className="w-full">
              Ir al Inicio
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-blue-600 text-white';
      case 'enterprise': return 'bg-purple-600 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return 'Gratuito';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración de Cuenta
            </h1>
          </div>
          <p className="text-gray-600">
            Gestiona tu perfil, suscripción y configuraciones de privacidad.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* User Profile Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{user.displayName || 'Usuario'}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {userProfile?.plan && (
                      <Badge className={getPlanBadgeColor(userProfile.plan)}>
                        {getPlanName(userProfile.plan)}
                      </Badge>
                    )}
                    {userProfile?.plan !== 'free' && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CrownIcon className="h-4 w-4" />
                        <span>Usuario Premium</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email verificado:</span>
                  <span className={user.emailVerified ? 'text-green-600' : 'text-orange-600'}>
                    {user.emailVerified ? 'Sí' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Miembro desde:</span>
                  <span>{formatDate(user.metadata?.creationTime)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <SmartphoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Último acceso:</span>
                  <span>{formatDate(user.metadata?.lastSignInTime)}</span>
                </div>
              </div>
            </Card>

            {/* Subscription Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mi Suscripción</h3>
              <SubscriptionManager />
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-start">
                    <CrownIcon className="h-4 w-4 mr-2" />
                    Ver Planes de Suscripción
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" className="w-full justify-start">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Volver a la App
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Plan Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Resumen del Plan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Plan actual:</span>
                  <Badge className={getPlanBadgeColor(userProfile?.plan || 'free')}>
                    {getPlanName(userProfile?.plan || 'free')}
                  </Badge>
                </div>
                
                {userProfile?.plan === 'free' && (
                  <div className="pt-3 border-t">
                    <p className="text-gray-600 mb-3">
                      Upgrade para desbloquear:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Más dispositivos</li>
                      <li>• Mayor almacenamiento</li>
                      <li>• Funciones premium</li>
                    </ul>
                    <Link href="/pricing">
                      <Button size="sm" className="w-full mt-3">
                        Ver Planes
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Privacy & Data */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-red-600">Zona de Peligro</h3>
              <p className="text-sm text-gray-600 mb-4">
                Acciones irreversibles que afectan permanentemente tu cuenta.
              </p>
              
              <Button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Eliminar Cuenta
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                Esta acción eliminará permanentemente todos tus datos y no se puede deshacer.
              </p>
            </Card>

            {/* Support */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Soporte</h3>
              <p className="text-sm text-gray-600 mb-3">
                ¿Necesitas ayuda con tu cuenta?
              </p>
              <p className="text-xs text-gray-500">
                Contacto: support@copynpaste.app
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
