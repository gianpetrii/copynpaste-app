'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react'

export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'unknown'>('unknown')

  useEffect(() => {
    // Detectar si está instalado (modo standalone)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      setIsInstalled(standalone)
    }

    // Detectar tipo de dispositivo
    const checkDeviceType = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setDeviceType(isMobile ? 'mobile' : 'desktop')
    }

    // Detectar estado de conexión
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    checkInstalled()
    checkDeviceType()
    updateOnlineStatus()

    // Listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listener para cambios en display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(checkInstalled)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      mediaQuery.removeListener(checkInstalled)
    }
  }, [])

  if (!isInstalled && isOnline) {
    return null // No mostrar nada si no está instalado y está online
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      {isInstalled && (
        <Badge 
          variant="secondary" 
          className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"
        >
          {deviceType === 'mobile' ? (
            <Smartphone className="h-3 w-3" />
          ) : (
            <Monitor className="h-3 w-3" />
          )}
          <span className="text-xs">PWA Instalada</span>
        </Badge>
      )}
      
      {!isOnline && (
        <Badge 
          variant="secondary" 
          className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1"
        >
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Sin conexión</span>
        </Badge>
      )}
      
      {isOnline && isInstalled && (
        <Badge 
          variant="secondary" 
          className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
        >
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Online</span>
        </Badge>
      )}
    </div>
  )
} 