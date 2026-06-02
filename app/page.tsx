"use client"

import { useState, useEffect } from "react"
import { AuthButtons } from "@/components/auth-buttons"
import { AddItemForm } from "@/components/add-item-form"
import { ItemList } from "@/components/item-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/context/auth-context"
import { useItems } from "@/lib/hooks"
import { 
  Sparkles, 
  Shield, 
  Zap,
  FileText,
  Link as LinkIcon,
  Upload,
  Star
} from "lucide-react"
import { ClipboardIcon } from "@/components/ui/clipboard-icon"
import UserPlanBanner from "@/components/features/banners/user-plan-banner"
import { PlanNavBadge } from "@/components/features/banners/plan-nav-badge"
import Link from "next/link"
import { isNativePlatform } from "@/lib/native/platform"
import { AnimatedPanel } from "@/components/page-transition"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isNative, setIsNative] = useState<boolean | null>(null)
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid || "")

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      if (!savedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }

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
  }

  // Stats para el dashboard
  const totalItems = items.length
  const favoriteItems = items.filter(item => item.favorite).length
  const textItems = items.filter(item => item.type === 'text').length
  const fileItems = items.filter(item => item.type === 'file').length
  const urlItems = items.filter(item => item.type === 'url').length
  const isNativeLogin = isNative === true && !user

  // Prevent hydration mismatch and native/web flash before platform is detected
  if (!mounted || isNative === null) {
    return (
      <main className="min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <header className="flex justify-between items-center py-1 sm:py-2 mb-2 sm:mb-3 border-b border-border/50">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 navbar-logo">
            <ClipboardIcon className="text-primary" size={28} />
            <div>
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground navbar-title tracking-tight">
                Copy & Paste
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground navbar-subtitle">
                Tu portapapeles universal
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={isNativeLogin ? "flex flex-col h-dvh max-h-dvh overflow-hidden" : "min-h-screen"}>
      <div className={`w-full max-w-7xl mx-auto sm:px-2 lg:px-4 ${isNativeLogin ? "flex flex-1 flex-col min-h-0" : ""}`}>
        {/* Navbar — oculto en login nativo (pantalla propia con safe-area) */}
        {!isNativeLogin && (
        <header className="flex justify-between items-center py-1 sm:py-2 mb-2 sm:mb-3 border-b border-border/50">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 navbar-logo">
            <ClipboardIcon className="text-primary" size={28} />
            <div>
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-foreground navbar-title tracking-tight">
                Copy & Paste
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground navbar-subtitle">
                Tu portapapeles universal
              </p>
            </div>
          </div>
          
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
            {/* En native sin usuario el form ya está visible, no necesitamos botones de nav */}
            {(!isNative || user) && <AuthButtons compact={true} />}
          </div>
        </header>
        )}

        {user ? (
          /* Dashboard para usuarios logueados - Layout responsive */
          <div className="space-y-2 sm:space-y-3">
            {/* Plan Banner — oculto en mobile (se muestra como badge en el navbar) */}
            <div className="hidden sm:block">
              <UserPlanBanner />
            </div>
            {/* Layout mejorado - columna izquierda más ancha en desktop */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {/* Welcome section y form */}
              <div className="w-full">
                <div className="lg:sticky lg:top-4 space-y-2 sm:space-y-3">
                  {/* Welcome section - Desktop: grande, Mobile/Tablet: horizontal */}
                  <div className="lg:text-center lg:space-y-2">
                    {/* Desktop: Saludo grande con líneas separadas */}
                    <div className="hidden lg:block">
                      <h2 className="text-lg xl:text-2xl font-bold text-foreground">
                        ¡Hola, {user.displayName?.split(' ')[0] || 'Usuario'}! <span className="wave-greeting">👋</span>
                      </h2>
                      <p className="text-sm lg:text-base text-muted-foreground">
                        Tienes <span className="font-semibold text-foreground">{totalItems}</span> elementos guardados
                      </p>
                      {/* Stats horizontales para desktop */}
                      {totalItems > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs lg:text-sm mt-2">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{textItems} textos</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <LinkIcon className="h-3 w-3" />
                            <span>{urlItems} enlaces</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Upload className="h-3 w-3" />
                            <span>{fileItems} archivos</span>
                          </div>
                          {favoriteItems > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{favoriteItems} favoritos</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mobile/Tablet: Saludo horizontal con iconos */}
                    <div className="lg:hidden">
                      <div className="flex items-center justify-between gap-1 text-left">
                        <h2 className="text-sm sm:text-lg font-bold text-foreground">
                          ¡Hola, {user.displayName?.split(' ')[0] || 'Usuario'}! <span className="wave-greeting">👋</span>
                        </h2>
                        {/* Stats horizontales con iconos */}
                        {totalItems > 0 && (
                          <div className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{textItems}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <LinkIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{urlItems}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{fileItems}</span>
                            </div>
                            {favoriteItems > 0 && (
                              <div className="flex items-center gap-0.5 text-amber-600">
                                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                                <span>{favoriteItems}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Formulario */}
            <AddItemForm />
                </div>
              </div>

              {/* Lista de items */}
              <div className="w-full">
                <div className="space-y-2">
              <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="all"
                    onClick={() => setActiveTab("all")}
                        className="flex items-center gap-1 text-sm lg:text-base"
                  >
                        <FileText className="h-3.5 w-3.5" />
                        Todos ({totalItems})
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    onClick={() => setActiveTab("favorites")}
                        className="flex items-center gap-1 text-sm lg:text-base"
                  >
                        <Star className="h-3.5 w-3.5" />
                        Favoritos ({favoriteItems})
                  </TabsTrigger>
                </TabsList>
                    <AnimatedPanel panelKey={activeTab} className="mt-2">
                <ItemList filter={activeTab} />
                    </AnimatedPanel>
              </Tabs>
                </div>
              </div>
            </div>
          </div>
        ) : isNative ? (
          /* Pantalla de login nativa — sin scroll extra, safe-area solo arriba */
          <div className="safe-area-top safe-area-bottom flex flex-1 flex-col items-center justify-center min-h-0 px-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-sm mx-auto flex flex-col items-center space-y-8">
              <div className="flex flex-col items-center space-y-4">
                <ClipboardIcon className="text-primary hero-icon-banner" size={80} />
                <div className="text-center space-y-1">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Copy &amp; Paste
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Tu portapapeles universal
                  </p>
                </div>
              </div>

              <div className="w-full">
                <AuthButtons compact={false} />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Simple. Seguro. Sincronizado.
              </p>
            </div>
          </div>
        ) : (
          /* Hero section web — landing completa */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero principal — stack vertical centrado */}
            <div className="text-center space-y-8 max-w-3xl">
              <ClipboardIcon className="text-primary hero-icon-banner mx-auto" size={80} />

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  Tu portapapeles{" "}
                  <span className="text-primary">universal</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Guarda, organiza y accede a tu información importante desde cualquier dispositivo.
                </p>
              </div>

              <div className="pt-2 max-w-md mx-auto" id="auth-section">
                <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
                  <AuthButtons compact={false} />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
              <div className="text-center space-y-3 p-5 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Acceso Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Copia cualquier contenido con un solo clic desde cualquier dispositivo
                </p>
              </div>

              <div className="text-center space-y-3 p-5 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Totalmente Seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Tus datos están protegidos y solo tú puedes acceder a ellos
                </p>
              </div>

              <div className="text-center space-y-3 p-5 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Multi-formato</h3>
                <p className="text-sm text-muted-foreground">
                  Textos, enlaces, archivos y más. Todo en un solo lugar organizado
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

