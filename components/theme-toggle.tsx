"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  onToggle: () => void
  isDark: boolean
}

export function ThemeToggle({ onToggle, isDark }: ThemeToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
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