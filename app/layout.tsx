import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/context/auth-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Copy&Paste - Portapapeles Universal",
  description: "Comparte texto, archivos y enlaces entre dispositivos fácilmente",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className={`${inter.className} ${inter.variable} bg-background text-foreground min-h-screen`}>
        <AuthProvider>
          <div className="mx-auto max-w-3xl px-4 py-6">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-primary">Copy&Paste</h1>
              <p className="text-sm text-muted-foreground">Tu portapapeles universal</p>
            </header>
            <main>
              {children}
            </main>
            <footer className="mt-8 text-center text-xs text-muted-foreground py-4">
              <p>© {new Date().getFullYear()} Copy&Paste - Todos los derechos reservados</p>
            </footer>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

