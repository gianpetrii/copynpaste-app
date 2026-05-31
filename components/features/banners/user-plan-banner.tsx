'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useItems } from '@/lib/hooks';
import { PLAN_LIMITS } from '@/lib/firebase/device-manager';
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

  const itemsUsagePercent = planLimits.maxItems > 0
    ? Math.min((currentItems / planLimits.maxItems) * 100, 100)
    : 0;

  useEffect(() => {
    if (currentPlan === 'free') {
      const isNearLimit = itemsUsagePercent > 70;
      const hasItems = currentItems > 5;
      setShouldShowUpgrade(isNearLimit || hasItems);
    }
  }, [currentPlan, itemsUsagePercent, currentItems]);

  if (!user) return null;

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white';
      case 'enterprise':
        return 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-purple-800/60 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CrownIcon className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
              Plan {getPlanName(currentPlan)}
            </span>
            <Badge className={getPlanBadgeColor(currentPlan)}>
              {getPlanName(currentPlan)}
            </Badge>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="auth-button button-secondary text-xs"
            >
              Gestionar Plan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Banner para usuarios gratuitos
  if (shouldShowUpgrade) {
    if (itemsUsagePercent > 90) {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ZapIcon className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {`${Math.round(itemsUsagePercent)}% del límite usado`}
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                {`Tienes ${currentItems}/${planLimits.maxItems} elementos. ¡Upgrade para más espacio!`}
              </p>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white text-xs">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          </div>
          {itemsUsagePercent > 70 && (
            <div className="mt-2">
              <div className="w-full bg-green-200 dark:bg-green-900/60 rounded-full h-1.5">
                <div
                  className="bg-green-600 dark:bg-green-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${itemsUsagePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ZapIcon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {itemsUsagePercent > 70
                  ? `${Math.round(itemsUsagePercent)}% del límite usado`
                  : '¡Mejora tu experiencia!'}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {itemsUsagePercent > 70
                ? `Tienes ${currentItems}/${planLimits.maxItems} elementos. ¡Upgrade para más espacio!`
                : 'Desbloquea más dispositivos y almacenamiento con Premium'}
            </p>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        </div>
        {itemsUsagePercent > 70 && (
          <div className="mt-2">
            <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-1.5">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${itemsUsagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
