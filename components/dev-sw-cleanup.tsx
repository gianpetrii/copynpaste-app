'use client'

import { useEffect } from 'react'

export default function DevSwCleanup() {
  useEffect(() => {
    // Solo actuar en dev/local
    if (process.env.NODE_ENV === 'production') return

    // Unregister todos los SWs
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister().catch(() => {}))
      })
    }

    // Limpiar caches del SW
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k))
      })
    }
  }, [])

  return null
}


