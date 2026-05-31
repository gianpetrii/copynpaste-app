"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { LogOut, User, Mail, Lock, ArrowLeft, KeyRound, Fingerprint } from "lucide-react"
import {
  authenticateWithBiometric,
  enableBiometricLogin,
  isBiometricAvailable,
  isBiometricLoginEnabled,
} from "@/lib/native/biometrics"
import { isNativePlatform } from "@/lib/native/platform"
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

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

type AuthMode = "login" | "register" | "reset" | "google"

interface AuthButtonsProps {
  compact?: boolean;
}

export function AuthButtons({ compact = false }: AuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("google")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const { toast } = useToast()
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout } = useAuth()

  // Solo renderizar después de montaje para evitar hidratación
  useEffect(() => {
    // Detectar si estamos en móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Cargar modo de autenticación guardado
    const loadSavedAuthMode = () => {
      const savedAuthMode = localStorage.getItem('authMode');
      if (savedAuthMode && !compact) {
        setAuthMode(savedAuthMode as AuthMode);
        localStorage.removeItem('authMode'); // Limpiar después de usar
      }
    };
    
    // Ejecutar todo después del montaje
    checkMobile();
    loadSavedAuthMode();
    setMounted(true);

    const checkBiometric = async () => {
      const native = await isNativePlatform();
      if (native) {
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);
        setBiometricEnabled(isBiometricLoginEnabled());
      }
    };
    checkBiometric();
    
    // Configurar event listeners
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [compact]);

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      const credentials = await authenticateWithBiometric();
      if (!credentials) return;

      setEmail(credentials.email);
      setPassword(credentials.password);
      await loginWithEmail(credentials.email, credentials.password);
      toast({
        title: "🎉 ¡Bienvenido!",
        description: "Sesión iniciada con biometría",
      });
    } catch (error: any) {
      toast({
        title: "Error biométrico",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      const native = await isNativePlatform();
      if (native && (await isBiometricAvailable()) && !isBiometricLoginEnabled()) {
        const enabled = await enableBiometricLogin(email, password);
        if (enabled) setBiometricEnabled(true);
      }

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

  // Renderizar un placeholder durante SSR
  if (!mounted) {
    return (
      <Button
        variant="outline"
        disabled
        size="default"
        className="auth-button button-secondary flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        {compact ? "..." : "Cargando..."}
      </Button>
    );
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
          className="auth-button button-secondary text-xs sm:text-base"
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
          className="auth-button button-primary text-xs sm:text-base"
        >
          Registrarse
        </Button>
      </div>
    )
  }

  // Para la página principal (hero), mostrar opciones de autenticación
  const isHeroPage = !user;

  if (isHeroPage) {
    const btnHeight = isMobile ? "py-4" : ""

    if (authMode === "google") {
      return (
        <div
          key="google"
          className="flex flex-col items-center space-y-5 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className={`auth-button button-secondary button-google w-full flex items-center justify-center gap-3 font-medium ${btnHeight}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                Iniciando...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continuar con Google
              </>
            )}
          </Button>

          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-sm text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => { setAuthMode("login"); resetForm() }}
              className={`auth-button button-secondary flex items-center gap-2 flex-1 ${btnHeight}`}
            >
              <Mail className="h-4 w-4" />
              Iniciar sesión
            </Button>
            <Button
              variant="outline"
              onClick={() => { setAuthMode("register"); resetForm() }}
              className={`auth-button button-secondary flex items-center gap-2 flex-1 ${btnHeight}`}
            >
              <User className="h-4 w-4" />
              Registrarse
            </Button>
          </div>

          {biometricAvailable && biometricEnabled && (
            <Button
              variant="outline"
              onClick={handleBiometricLogin}
              disabled={isLoading}
              className={`auth-button button-secondary w-full flex items-center gap-2 ${btnHeight}`}
            >
              <Fingerprint className="h-4 w-4" />
              Iniciar con biometría
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Gratis para siempre. No se requiere tarjeta de crédito.
          </p>
        </div>
      )
    }

    // Formularios de login/registro/reset
    return (
      <div
        key={authMode}
        className="w-full max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        <div className="relative flex items-center justify-center h-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setAuthMode("google"); resetForm() }}
            className="absolute left-0 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={isMobile ? "h-12 text-base" : ""}
            />
          </div>

          {authMode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={isMobile ? "h-12 text-base" : ""}
              />
            </div>
          )}

          {authMode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={isMobile ? "h-12 text-base" : ""}
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
            className={`auth-button button-primary w-full ${isMobile ? "h-12 text-base" : ""}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {authMode === "reset" ? "Enviando..." : "Procesando..."}
              </>
            ) : (
              <>
                {authMode === "login" && <><Lock className="h-4 w-4 mr-2" />Iniciar sesión</>}
                {authMode === "register" && <><User className="h-4 w-4 mr-2" />Crear cuenta</>}
                {authMode === "reset" && <><KeyRound className="h-4 w-4 mr-2" />Enviar enlace</>}
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            {authMode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => { setAuthMode("reset"); resetForm() }}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("register"); resetForm() }}
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
                  onClick={() => { setAuthMode("login"); resetForm() }}
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

