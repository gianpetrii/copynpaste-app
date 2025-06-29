import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Copy&Paste - Portapapeles Universal",
  description: "Comparte texto, archivos y enlaces entre dispositivos fácilmente",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <div className="mx-auto max-w-3xl px-4 py-4">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

