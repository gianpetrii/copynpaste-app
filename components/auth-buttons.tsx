"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { LogOut, User, Chrome, Mail, Lock, ArrowLeft, KeyRound } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type AuthMode = "login" | "register" | "reset" | "google"

interface AuthButtonsProps {
  compact?: boolean;
}

export function AuthButtons({ compact = false }: AuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("google")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { toast } = useToast()
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout } = useAuth()

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

  // Escuchar cambios en localStorage para cambiar el modo de autenticación
  useEffect(() => {
    const savedAuthMode = localStorage.getItem('authMode');
    if (savedAuthMode && !compact) {
      setAuthMode(savedAuthMode as AuthMode);
      localStorage.removeItem('authMode'); // Limpiar después de usar
    }
  }, [compact]);

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

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa email y contraseña",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await loginWithEmail(email, password)
      toast({
        title: "🎉 ¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailRegister = async () => {
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que las contraseñas sean iguales",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await registerWithEmail(email, password)
      toast({
        title: "🎉 ¡Cuenta creada!",
        description: "Te has registrado exitosamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ha ocurrido un error al crear la cuenta",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para recuperar la contraseña",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(email)
      toast({
        title: "Email enviado",
        description: "Revisa tu email para restablecer tu contraseña",
      })
      setAuthMode("login")
    } catch (error: any) {
      toast({
        title: "Error al enviar email",
        description: error.message || "Ha ocurrido un error al enviar el email",
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

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  if (user) {
    return (
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={isLoading}
            size={isMobile ? "sm" : "default"}
            className="auth-button logout-button flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isMobile ? "Salir" : "Cerrar sesión"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Si está en modo compacto (navbar), mostrar opciones simples
  if (compact && !user) {
  return (
      <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
          size="sm"
          onClick={() => {
            // Guardar preferencia para iniciar sesión y hacer scroll hacia la sección de auth
            localStorage.setItem('authMode', 'login')
            const authSection = document.getElementById('auth-section')
            if (authSection) {
              authSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="auth-button button-secondary text-xs sm:text-sm"
        >
          Iniciar sesión
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            // Guardar preferencia para registro y hacer scroll hacia la sección de auth
            localStorage.setItem('authMode', 'register')
            const authSection = document.getElementById('auth-section')
            if (authSection) {
              authSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="auth-button button-primary text-xs sm:text-sm"
        >
          Registrarse
        </Button>
      </div>
    )
  }

  // Para la página principal (hero), mostrar opciones de autenticación
  const isHeroPage = !user;

  if (isHeroPage) {
    if (authMode === "google") {
      return (
        <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
          {/* Botón principal de Google */}
          <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
            size="lg"
            className="auth-button button-primary hero-cta w-full flex items-center gap-3 px-8 py-4"
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
          
          {/* Divider */}
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-sm text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          {/* Opciones alternativas */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setAuthMode("login")
                resetForm()
              }}
              className="button-secondary flex items-center gap-2 flex-1"
            >
              <Mail className="h-4 w-4" />
              Iniciar sesión
      </Button>
      <Button 
              variant="outline"
              onClick={() => {
                setAuthMode("register")
                resetForm()
              }}
              className="button-secondary flex items-center gap-2 flex-1"
            >
              <User className="h-4 w-4" />
              Registrarse
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Gratis para siempre. No se requiere tarjeta de crédito.
          </p>
        </div>
      )
    }

    // Formularios de login/registro/reset
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthMode("google")
              resetForm()
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h2 className="text-xl font-semibold">
            {authMode === "login" && "Iniciar sesión"}
            {authMode === "register" && "Crear cuenta"}
            {authMode === "reset" && "Recuperar contraseña"}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {authMode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {authMode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <Button
            onClick={() => {
              if (authMode === "login") handleEmailLogin()
              else if (authMode === "register") handleEmailRegister()
              else if (authMode === "reset") handlePasswordReset()
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {authMode === "reset" ? "Enviando..." : "Procesando..."}
              </>
            ) : (
              <>
                {authMode === "login" && (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Iniciar sesión
                  </>
                )}
                {authMode === "register" && (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Crear cuenta
                  </>
                )}
                {authMode === "reset" && (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Enviar enlace
                  </>
                )}
              </>
            )}
          </Button>

          {/* Links de navegación */}
          <div className="text-center space-y-2">
            {authMode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("reset")
                    resetForm()
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register")
                      resetForm()
                    }}
                    className="text-primary hover:underline"
                  >
                    Regístrate
                  </button>
                </div>
              </>
            )}
            
            {authMode === "register" && (
              <div className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login")
                    resetForm()
                  }}
                  className="text-primary hover:underline"
                >
                  Inicia sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Para navbar cuando no hay usuario (caso edge)
  return (
    <Button
      variant="outline"
      onClick={() => setAuthMode("google")}
        disabled={isLoading}
        size={isMobile ? "sm" : "default"}
      className="auth-button button-secondary flex items-center gap-2"
      >
      <User className="h-4 w-4" />
      {isMobile ? "Entrar" : "Iniciar sesión"}
      </Button>
  )
}

