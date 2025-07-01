interface LogContext {
  userId?: string
  component?: string
  action?: string
  itemId?: string
  fileName?: string
  [key: string]: any
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    // En desarrollo, log todo
    if (this.isDevelopment) return true
    
    // En producción, solo errores y warnings
    return [LogLevel.ERROR, LogLevel.WARN].includes(level)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const fullContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : error,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, fullContext)
    console.error(formattedMessage)

    // En producción, aquí podrías enviar los errores a un servicio como Sentry
    if (!this.isDevelopment) {
      this.sendToErrorService(message, error, fullContext)
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, context)
    console.warn(formattedMessage)
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, context)
    console.info(formattedMessage)
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, context)
    console.debug(formattedMessage)
  }

  // Método para enviar errores a servicios externos en producción
  private sendToErrorService(message: string, error: Error | unknown, context: LogContext) {
    // Placeholder para integración con servicios como Sentry, LogRocket, etc.
    // En el futuro se puede implementar aquí
    try {
      // Ejemplo de lo que se podría hacer:
      // Sentry.captureException(error, { extra: context, tags: { component: context.component } })
    } catch (e) {
      // Fallar silenciosamente si el servicio de logging falla
    }
  }

  // Métodos de conveniencia para casos específicos
  authError(message: string, error?: Error | unknown, userId?: string) {
    this.error(message, error, { component: 'auth', userId })
  }

  fileError(message: string, error?: Error | unknown, fileName?: string, userId?: string) {
    this.error(message, error, { component: 'file', fileName, userId })
  }

  databaseError(message: string, error?: Error | unknown, itemId?: string, userId?: string) {
    this.error(message, error, { component: 'database', itemId, userId })
  }

  validationError(message: string, field?: string, value?: string) {
    this.warn(message, { component: 'validation', field, value: value?.substring(0, 100) })
  }
}

// Singleton instance
export const logger = new Logger()

// Helper functions para casos comunes
export const logError = (message: string, error?: Error | unknown, context?: LogContext) => {
  logger.error(message, error, context)
}

export const logWarning = (message: string, context?: LogContext) => {
  logger.warn(message, context)
}

export const logInfo = (message: string, context?: LogContext) => {
  logger.info(message, context)
} 