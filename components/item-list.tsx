"use client"

import { useState, useEffect, useRef } from "react"
import { ItemCard } from "@/components/item-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useItems } from "@/lib/hooks"
import { useAuth } from "@/lib/context/auth-context"

interface ItemListProps {
  filter?: "all" | "favorites"
}

export function ItemList({ filter = "all" }: ItemListProps) {
  const { user } = useAuth()
  const userId = user?.uid || ""
  const { items, loading } = useItems(userId)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "modified">("newest")
  const [filterType, setFilterType] = useState<"all" | "text" | "url" | "file">("all")
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set())
  const prevItemsRef = useRef<string[]>([])

  // Ensure we only display items for the authenticated user
  const isAuthenticated = !!userId
  
  // Detectar nuevos elementos agregados
  useEffect(() => {
    if (loading) return;
    
    const currentItemIds = items.map(item => item.id);
    const prevItemIds = prevItemsRef.current;
    
    // Si es la primera carga, solo guardar los IDs sin animar
    if (prevItemIds.length === 0) {
      prevItemsRef.current = currentItemIds;
      return;
    }
    
    // Encontrar los nuevos IDs que no estaban en la lista anterior
    const newIds = currentItemIds.filter(id => !prevItemIds.includes(id));
    
    if (newIds.length > 0 && sortBy === "newest") {
      // Agregar los nuevos IDs al conjunto de nuevos elementos
      setNewItemIds(new Set(newIds));
      
      // Marcar todos los elementos como animando
      setAnimatingItems(new Set(currentItemIds));
      
      // Configurar un temporizador para eliminar la animación después de un tiempo
      setTimeout(() => {
        setNewItemIds(new Set());
        setAnimatingItems(new Set());
      }, 1800); // Duración de la animación aumentada a 1.8 segundos
    }
    
    // Actualizar la referencia de los elementos anteriores
    prevItemsRef.current = currentItemIds;
  }, [items, loading, sortBy]);
  
  const filteredAndSortedItems = items
    .filter((item) => {
      // Extra security check to ensure we only show items for the current user
      if (item.userId !== userId) return false
      
      if (filterType === "all") return true
      return item.type === filterType
    })
    .filter((item) => {
      if (filter === "all") return true
      return item.favorite === true
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime()
      } else if (sortBy === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime()
      } else {
        // modified
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
      </div>
    )
  }

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="bg-secondary rounded-xl shadow-sm p-6 text-center">
          <p className="text-secondary-foreground">
            Inicia sesión para ver tus elementos guardados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-secondary/50 border border-border rounded-xl shadow-sm p-2 sm:p-3 mb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "text" | "url" | "file")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="url">Enlaces</SelectItem>
              <SelectItem value="file">Archivos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "modified")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground">
              <SelectValue placeholder="Más reciente" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
              <SelectItem value="newest">Más reciente</SelectItem>
              <SelectItem value="oldest">Más antiguo</SelectItem>
              <SelectItem value="modified">Última modificación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay elementos guardados</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredAndSortedItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`
                  transition-all duration-1500 ease-out
                  ${newItemIds.has(item.id) 
                    ? 'animate-slide-down' 
                    : animatingItems.has(item.id) && index > 0 
                      ? 'animate-push-down' 
                      : ''}
                `}
              >
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

