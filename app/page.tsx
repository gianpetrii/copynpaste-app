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
  ClipboardCopy, 
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
import Link from "next/link"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid || "")

  useEffect(() => {
    // Solo ejecutar en el cliente después del montaje
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      // Guardar explícitamente el tema claro si no hay preferencia
      if (!savedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
    
    // Marcar como montado
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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
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
    <main className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        {/* Navbar mejorado - más compacto en móvil */}
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
                <Link href="/pricing" className="hidden sm:block">
                  <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                    Planes
                  </button>
                </Link>
                <Link href="/account" className="hidden sm:block">
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                    Cuenta
                  </button>
                </Link>
              </>
            )}
            <ThemeToggle onToggle={handleThemeToggle} isDark={isDarkMode} />
            <AuthButtons compact={true} />
          </div>
        </header>

        {user ? (
          /* Dashboard para usuarios logueados - Layout responsive */
          <div className="space-y-2 sm:space-y-3">
            {/* Plan Banner */}
            <UserPlanBanner />
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
                    <TabsList className="grid w-full grid-cols-2 tabs-improved">
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
                    <div className="mt-2">
                <ItemList filter={activeTab} />
                    </div>
              </Tabs>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Hero section para usuarios sin login */
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-12">
            {/* Hero principal */}
            <div className="text-center space-y-6 max-w-4xl">
              <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
                <ClipboardIcon className="text-primary flex-shrink-0 hero-icon-banner" size={120} />
                <div className="text-left">
                  <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight whitespace-nowrap">
                    Tu portapapeles
                  </h1>
                  <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-primary leading-tight whitespace-nowrap">
                    universal
                  </h1>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg sm:text-2xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed hero-subtitle">
                  Guarda, organiza y accede a tu información importante desde cualquier dispositivo. 
                  <span className="block mt-2 text-primary font-medium">Simple. Seguro. Sincronizado.</span>
                </p>
              </div>

              <div className="pt-4" id="auth-section">
                <AuthButtons compact={false} />
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl w-full features-grid">
              <div className="text-center space-y-4 p-6 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground">Acceso Rápido</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Copia cualquier contenido con un solo clic y accede desde cualquier dispositivo
                </p>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground">Totalmente Seguro</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Tus datos están protegidos y solo tú puedes acceder a ellos
            </p>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-2xl bg-secondary/20 border border-border/50 feature-card">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground">Multi-formato</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Textos, enlaces, archivos y más. Todo en un solo lugar organizado
                </p>
              </div>
            </div>

            {/* CTA secondary */}
            <div className="text-center space-y-4 p-8 rounded-2xl bg-primary/5 border border-primary/20 max-w-2xl">
              <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
                ¿Listo para comenzar?
              </h3>
              <p className="text-base lg:text-lg text-muted-foreground">
                Inicia sesión con Google y comienza a organizar tu información en segundos
              </p>
              <div className="mt-4">
                <Link href="/pricing">
                  <button className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors">
                    Ver Planes Premium
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

