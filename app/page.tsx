"use client"

import { useState, useEffect } from "react"
import { AuthButtons } from "@/components/auth-buttons"
import { AddItemForm } from "@/components/add-item-form"
import { ItemList } from "@/components/item-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/context/auth-context"
import { Clipboard, ClipboardCopy } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }

  return (
    <main className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto px-2 sm:px-4">
        <header className="flex justify-between items-center mb-6 pt-4">
          <div className="flex items-center">
            <ClipboardCopy className="h-7 w-7 mr-2 text-foreground" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Copy & Paste App
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle onToggle={handleThemeToggle} isDark={isDarkMode} />
            <AuthButtons />
          </div>
        </header>

        {user ? (
          <>
            <AddItemForm />
            <div className="mt-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 ${activeTab === "all" ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    onClick={() => setActiveTab("favorites")}
                    className={`flex-1 ${activeTab === "favorites" ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    Favoritos
                  </TabsTrigger>
                </TabsList>
                <ItemList filter={activeTab} />
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="flex items-center mb-4">
              <ClipboardCopy className="h-12 w-12 sm:h-16 sm:w-16 mr-3 text-foreground" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Copy & Paste App
              </h2>
            </div>
            <p className="text-center text-lg sm:text-xl mb-6 sm:mb-8 px-2 text-muted-foreground">
              Tu espacio personal para guardar y acceder a todo lo importante con un solo clic.
            </p>
            <p className="text-center mb-6 sm:mb-8 px-2 text-muted-foreground">
              Guarda fragmentos de texto, código, enlaces y archivos para acceder a ellos desde cualquier dispositivo. 
              Inicia sesión para comenzar a organizar tu información.
            </p>
            <div className="flex space-x-4">
              <AuthButtons />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

