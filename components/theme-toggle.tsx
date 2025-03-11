"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  onToggle: () => void
  isDark: boolean
}

export function ThemeToggle({ onToggle, isDark }: ThemeToggleProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
        <Sun className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
      ) : (
        <Moon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
      )}
    </Button>
  )
} 