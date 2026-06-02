import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/context/auth-context"
import DeviceLimitWarning from "@/components/features/limits/device-limit-warning"
import DevSwCleanup from "@/components/dev-sw-cleanup"
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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/maskable-icon-512x512.svg', color: '#6D28D9' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CopyNPaste",
    startupImage: [
      { url: '/icons/icon-512x512.svg', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/icon-512x512.svg', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/icon-512x512.svg', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/icons/icon-512x512.svg', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
    ]
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
        url: '/icons/icon-512x512.svg',
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
    images: ['/icons/icon-512x512.svg'],
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
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CopyNPaste" />
        
        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CopyNPaste" />
        
        {/* Microsoft Meta Tags */}
        <meta name="msapplication-TileColor" content="#6D28D9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* En dev: limpiar SW/caches antes de cargar chunks (evita ChunkLoadError) */}
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function (regs) {
                      regs.forEach(function (reg) { reg.unregister(); });
                    });
                  }
                  if ('caches' in window) {
                    caches.keys().then(function (keys) {
                      keys.forEach(function (key) { caches.delete(key); });
                    });
                  }
                })();
              `,
            }}
          />
        )}

        {/* Service Worker Registration - only in production */}
        {process.env.NODE_ENV === 'production' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('✅ SW registered: ', registration);
                  }, function(registrationError) {
                    console.log('❌ SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
        )}
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <CapacitorProvider>
            <StatusBarCover />
            <div className="mx-auto max-w-7xl px-1 sm:px-4 pb-4 has-status-bar-cover">
              {children}
            </div>
            <Toaster />
            {process.env.NODE_ENV !== 'production' && <DevSwCleanup />}
            <DeviceLimitWarning />
          </CapacitorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

