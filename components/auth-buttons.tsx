"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { LogOut, User, Chrome } from "lucide-react"

export function AuthButtons() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()
  const { user, loginWithGoogle, logout } = useAuth()

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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await loginWithGoogle()
      toast({
        title: "🎉 ¡Bienvenido!",
        description: "Has iniciado sesión correctamente con Google",
      })
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Ha ocurrido un error al iniciar sesión con Google",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await logout()
      toast({
        title: "Sesión cerrada",
        description: "¡Hasta pronto! Has cerrado sesión correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Ha ocurrido un error al cerrar sesión",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return (
      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={isLoading}
        size={isMobile ? "sm" : "default"}
        className="auth-button logout-button flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        {isMobile ? "Salir" : "Cerrar sesión"}
      </Button>
    )
  }

  // Para la página principal (hero), mostrar un botón más prominente
  const isHeroPage = !user;

  if (isHeroPage) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          size="lg"
          className="auth-button hero-cta w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8 py-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              Iniciando...
            </>
          ) : (
            <>
              <Chrome className="h-5 w-5" />
              Continuar con Google
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center sm:text-left max-w-xs">
          Gratis para siempre. No se requiere tarjeta de crédito.
        </p>
      </div>
    )
  }

  // Para navbar cuando no hay usuario (caso edge)
  return (
    <Button
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      size={isMobile ? "sm" : "default"}
      className="auth-button flex items-center gap-2"
    >
      <User className="h-4 w-4" />
      {isMobile ? "Entrar" : "Iniciar sesión"}
    </Button>
  )
}

