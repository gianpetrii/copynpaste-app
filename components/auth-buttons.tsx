"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { User } from "firebase/auth"

export function AuthButtons() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, loginWithGoogle, logout } = useAuth()

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
      >
        Iniciar sesión
      </Button>
      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isLoading}
      >
        Registrarse
      </Button>
    </>
  )
}

