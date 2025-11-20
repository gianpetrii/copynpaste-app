'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detectar si ya está instalado (modo standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Listener para el evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Mostrar prompt después de un delay para mejor UX
      setTimeout(() => {
        if (!standalone) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    // Listener para detectar cuando se instala la app
    const handleAppInstalled = () => {
      console.log('🎉 PWA was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
      } else {
        console.log('❌ User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Volver a mostrar en 24 horas
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  // No mostrar si ya está instalado
  if (isStandalone) return null

  // Mostrar instrucciones para iOS
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="border-2 border-black bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Instalar CopyNPaste</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="h-6 w-6 p-0 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">
              Para instalar en tu iPhone:
            </p>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Toca el botón de compartir</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Selecciona &quot;Añadir a pantalla de inicio&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Toca &quot;Añadir&quot; para confirmar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar prompt para Android/Chrome
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="border-2 border-black bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Instalar CopyNPaste</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="h-6 w-6 p-0 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mb-4">
              Instala la app para un acceso más rápido y funciona sin conexión.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="px-3"
              >
                Ahora no
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 