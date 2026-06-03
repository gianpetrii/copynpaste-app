'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardIcon } from '@/components/ui/clipboard-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButtons } from '@/components/auth-buttons';
import { PlanNavBadge } from '@/components/features/banners/plan-nav-badge';
import { useAuth } from '@/lib/context/auth-context';
import { isNativePlatform } from '@/lib/native/platform';

export function AppNavbar() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
    isNativePlatform().then(setIsNative);
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted || isNative === null) {
    return (
      <header className="flex justify-between items-center py-1 sm:py-2 mb-2 sm:mb-3 border-b border-border/50">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          <ClipboardIcon className="text-primary" size={28} />
          <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground tracking-tight">
            Copy & Paste
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded animate-pulse" />
          <div className="w-20 h-8 bg-secondary rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center py-1 sm:py-2 mb-2 sm:mb-3 border-b border-border/50">
      <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3.5 hover:opacity-80 transition-opacity navbar-logo">
        <ClipboardIcon className="text-primary" size={28} />
        <div>
          <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground navbar-title tracking-tight">
            Copy & Paste
          </h1>
          <p className="hidden lg:block text-xs sm:text-sm lg:text-base text-muted-foreground navbar-subtitle">
            Tu portapapeles universal
          </p>
        </div>
      </Link>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {user && (
          <>
            <PlanNavBadge />
            <Link href="/pricing" className="hidden sm:block">
              <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 rounded-md transition-colors">
                Planes
              </button>
            </Link>
            <Link href="/account" className="hidden sm:block">
              <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5 rounded-md transition-colors">
                Cuenta
              </button>
            </Link>
          </>
        )}
        <ThemeToggle onToggle={handleThemeToggle} isDark={isDarkMode} />
        {(!isNative || user) && <AuthButtons compact={true} />}
      </div>
    </header>
  );
}
