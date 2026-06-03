import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/context/auth-context"
import DeviceLimitWarning from "@/components/features/limits/device-limit-warning"
import { CapacitorProvider } from "@/components/native/capacitor-provider"
import { StatusBarCover } from "@/components/native/status-bar-cover"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://copynpaste.app'),
  title: "CopyNPaste - Tu Portapapeles Universal",
  description: "Guarda, organiza y accede a tu información importante desde cualquier dispositivo. Simple. Seguro. Sincronizado.",
  keywords: ["portapapeles", "clipboard", "notas", "archivos", "sincronización", "productividad"],
  authors: [{ name: "CopyNPaste Team" }],
  creator: "CopyNPaste Team",
  publisher: "CopyNPaste Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  applicationName: "CopyNPaste",
  category: "productivity",
  classification: "Productivity App",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://copynpaste.app',
    siteName: 'CopyNPaste',
    title: 'CopyNPaste - Tu Portapapeles Universal',
    description: 'Guarda, organiza y accede a tu información importante desde cualquier dispositivo. Simple. Seguro. Sincronizado.',
    images: [
      {
        url: '/favicon.svg',
        width: 512,
        height: 512,
        alt: 'CopyNPaste Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CopyNPaste - Tu Portapapeles Universal',
    description: 'Guarda, organiza y accede a tu información importante desde cualquier dispositivo. Simple. Seguro. Sincronizado.',
    images: ['/favicon.svg'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#130E1C' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head />
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <CapacitorProvider>
            <StatusBarCover />
            <div className="mx-auto max-w-7xl px-1 sm:px-4 pb-4 has-status-bar-cover">
              {children}
            </div>
            <Toaster />
            <DeviceLimitWarning />
          </CapacitorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

