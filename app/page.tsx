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
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <ClipboardCopy className="h-8 w-8 mr-2 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">
              Copy & Paste App
            </h1>
          </div>
          <div className="flex space-x-2 items-center">
            <ThemeToggle onToggle={handleThemeToggle} isDark={isDarkMode} />
            <AuthButtons />
          </div>
        </header>

        {user ? (
          <>
            <AddItemForm />
            <div className="mt-8">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className={activeTab === "all" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    onClick={() => setActiveTab("favorites")}
                    className={activeTab === "favorites" ? "bg-primary text-primary-foreground" : ""}
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
              <ClipboardCopy className="h-16 w-16 mr-3 text-foreground" />
              <h2 className="text-3xl font-bold text-foreground">
                Copy & Paste App
              </h2>
            </div>
            <p className="text-center text-xl mb-8 max-w-md text-muted-foreground">
              Tu espacio personal para guardar y acceder a todo lo importante con un solo clic.
            </p>
            <p className="text-center mb-8 max-w-lg text-muted-foreground">
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

