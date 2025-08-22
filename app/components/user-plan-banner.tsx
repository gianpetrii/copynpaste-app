'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useItems } from '@/lib/hooks';
import { PLAN_LIMITS, PLAN_PRICES } from '@/lib/firebase/device-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CrownIcon, TrendingUpIcon, ZapIcon } from 'lucide-react';
import Link from 'next/link';

export default function UserPlanBanner() {
  const { user, userProfile } = useAuth();
  const { items } = useItems(user?.uid || '');
  const [shouldShowUpgrade, setShouldShowUpgrade] = useState(false);

  const currentPlan = userProfile?.plan || 'free';
  const planLimits = PLAN_LIMITS[currentPlan];
  const currentItems = items.length;

  // Calcular porcentaje de uso
  const itemsUsagePercent = planLimits.maxItems > 0 
    ? Math.min((currentItems / planLimits.maxItems) * 100, 100)
    : 0;

  useEffect(() => {
    if (currentPlan === 'free') {
      // Mostrar upgrade si está cerca del límite o después de cierto tiempo de uso
      const isNearLimit = itemsUsagePercent > 70;
      const hasItems = currentItems > 5;
      setShouldShowUpgrade(isNearLimit || hasItems);
    }
  }, [currentPlan, itemsUsagePercent, currentItems]);

  if (!user) return null;

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

  // Banner para usuarios premium/enterprise
  if (currentPlan !== 'free') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CrownIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium">Plan {getPlanName(currentPlan)}</span>
            <Badge className={getPlanBadgeColor(currentPlan)}>
              {getPlanName(currentPlan)}
            </Badge>
          </div>
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="text-xs">
              Gestionar Plan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Banner para usuarios gratuitos
  if (shouldShowUpgrade) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ZapIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {itemsUsagePercent > 70 
                  ? `${Math.round(itemsUsagePercent)}% del límite usado` 
                  : '¡Mejora tu experiencia!'
                }
              </span>
            </div>
            <p className="text-xs text-yellow-700">
              {itemsUsagePercent > 70 
                ? `Tienes ${currentItems}/${planLimits.maxItems} elementos. ¡Upgrade para más espacio!`
                : 'Desbloquea más dispositivos y almacenamiento con Premium'
              }
            </p>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        </div>
        {itemsUsagePercent > 70 && (
          <div className="mt-2">
            <div className="w-full bg-yellow-200 rounded-full h-1.5">
              <div 
                className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${itemsUsagePercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
