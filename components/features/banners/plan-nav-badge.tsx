'use client';

import Link from 'next/link';
import { CrownIcon, ZapIcon } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { useItems } from '@/lib/hooks';
import { PLAN_LIMITS } from '@/lib/firebase/device-manager';

export function PlanNavBadge() {
  const { user, userProfile } = useAuth();
  const { items } = useItems(user?.uid || '');

  if (!user) return null;

  const currentPlan = userProfile?.plan || 'free';
  const planLimits = PLAN_LIMITS[currentPlan];
  const usagePercent = planLimits.maxItems > 0
    ? Math.min((items.length / planLimits.maxItems) * 100, 100)
    : 0;

  const isPremium = currentPlan !== 'free';
  const isNearLimit = usagePercent > 70;

  if (isPremium) {
    return (
      <Link href="/pricing" className="sm:hidden">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
          <CrownIcon className="h-3 w-3" />
          {currentPlan === 'enterprise' ? 'Ent.' : 'Pro'}
        </span>
      </Link>
    );
  }

  if (isNearLimit) {
    return (
      <Link href="/pricing" className="sm:hidden">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
          <ZapIcon className="h-3 w-3" />
          {Math.round(usagePercent)}%
        </span>
      </Link>
    );
  }

  return (
    <Link href="/pricing" className="sm:hidden">
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
        Free
      </span>
    </Link>
  );
}
