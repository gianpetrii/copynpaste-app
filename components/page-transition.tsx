'use client'

import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both motion-reduce:animate-none ${className}`}
    >
      {children}
    </div>
  )
}

interface AnimatedPanelProps {
  children: ReactNode
  panelKey: string
  className?: string
}

export function AnimatedPanel({ children, panelKey, className = '' }: AnimatedPanelProps) {
  return (
    <div
      key={panelKey}
      className={`animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both motion-reduce:animate-none ${className}`}
    >
      {children}
    </div>
  )
}
