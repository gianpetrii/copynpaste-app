"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { User } from "firebase/auth"

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
        title: "Sesión iniciada",
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
        description: "Has cerrado sesión correctamente",
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
        className="auth-button logout-button"
      >
        Cerrar sesión
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        size={isMobile ? "sm" : "default"}
        className="auth-button"
      >
        {isMobile ? "Entrar" : "Iniciar sesión"}
      </Button>
      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isLoading}
        size={isMobile ? "sm" : "default"}
        className="auth-button"
      >
        {isMobile ? "Registro" : "Registrarse"}
      </Button>
    </>
  )
}

