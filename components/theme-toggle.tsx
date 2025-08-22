'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  onToggle: () => void
  isDark: boolean
}

export function ThemeToggle({ onToggle, isDark }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  
  // Solo renderizar después de montaje para evitar hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar un placeholder durante SSR
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="theme-toggle-button"
        aria-label="Tema"
        disabled
      >
        <span className="sr-only">Tema</span>
        <Moon className="h-5 w-5" />
      </Button>
    )
  }

  // Renderizar el botón real solo en el cliente
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="theme-toggle-button"
      aria-label="Cambiar tema"
    >
      <span className="sr-only">Cambiar tema</span>
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}