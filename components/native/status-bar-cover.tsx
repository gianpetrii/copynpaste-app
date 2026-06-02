'use client';

import { useEffect, useState } from 'react';
import { isNativePlatform } from '@/lib/native/platform';

export function StatusBarCover() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    isNativePlatform().then(setIsNative);
  }, []);

  if (!isNative) return null;

  return <div className="status-bar-cover" aria-hidden="true" />;
}
