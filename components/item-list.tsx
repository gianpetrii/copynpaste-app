"use client"

import { useState, useEffect, useRef } from "react"
import { ItemCard } from "@/components/item-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useItems } from "@/lib/hooks"
import { useAuth } from "@/lib/context/auth-context"
import { 
  Search, 
  Trash2,
  AlertTriangle
} from "lucide-react"
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

interface ItemListProps {
  filter?: "all" | "favorites"
}

export function ItemList({ filter = "all" }: ItemListProps) {
  const { user } = useAuth()
  const userId = user?.uid || ""
  const { items, loading, deleteItem } = useItems(userId)
  const { toast } = useToast()
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "modified">("newest")
  const [filterType, setFilterType] = useState<"all" | "text" | "url" | "file">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
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

  // Función para eliminar todos los elementos
  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true)
      
      // Obtener todos los elementos filtrados actualmente visibles
      const itemsToDelete = filteredAndSortedItems
      
      if (itemsToDelete.length === 0) {
        toast({
          title: "No hay elementos para eliminar",
          description: "No se encontraron elementos que coincidan con los filtros actuales",
          variant: "destructive",
        })
        return
      }

      // Eliminar todos los elementos uno por uno
      const deletePromises = itemsToDelete.map(item => deleteItem(item.id))
      await Promise.all(deletePromises)
      
      toast({
        title: "✅ Elementos eliminados",
        description: `Se eliminaron ${itemsToDelete.length} elemento${itemsToDelete.length === 1 ? '' : 's'} correctamente`,
      })
      
      // Limpiar búsqueda después de eliminar
      setSearchQuery("")
      
    } catch (error) {
      toast({
        title: "Error al eliminar elementos",
        description: "Ocurrió un error al intentar eliminar los elementos",
        variant: "destructive",
      })
      console.error("Error deleting all items:", error)
    } finally {
      setIsDeleting(false)
    }
  }
  
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
    .filter((item) => {
      // Búsqueda por contenido
      if (!searchQuery.trim()) return true
      
      const query = searchQuery.toLowerCase()
      const content = (item.content || "").toLowerCase()
      const fileName = (item.fileName || "").toLowerCase()
      
      return content.includes(query) || fileName.includes(query)
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
        <div className="flex justify-between mb-4">
          <div className="flex items-center text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            <span>Cargando elementos...</span>
          </div>
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
      <div className="bg-secondary/50 border border-border rounded-xl shadow-sm p-2 mb-2">
        
        {/* Barra de búsqueda compacta */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm lg:text-base bg-background border-border text-foreground"
            />
          </div>
        </div>

        {/* Filtros compactos */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "text" | "url" | "file")}>
              <SelectTrigger className="flex-1 h-8 text-sm lg:text-base bg-background border-border text-foreground">
                <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="url">Enlaces</SelectItem>
              <SelectItem value="file">Archivos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "modified")}>
              <SelectTrigger className="flex-1 h-8 text-sm lg:text-base bg-background border-border text-foreground">
                <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="newest">Reciente</SelectItem>
                <SelectItem value="oldest">Antiguo</SelectItem>
                <SelectItem value="modified">Modificado</SelectItem>
            </SelectContent>
          </Select>
        </div>

          {/* Botón eliminar todos compacto */}
          {filteredAndSortedItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-sm lg:text-base text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isDeleting ? "Eliminando..." : `Eliminar (${filteredAndSortedItems.length})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    ¿Eliminar todos los elementos?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará <strong>{filteredAndSortedItems.length}</strong> elemento{filteredAndSortedItems.length === 1 ? '' : 's'} 
                    {searchQuery && ` que coinciden con "${searchQuery}"`}
                    {filterType !== "all" && ` del tipo "${filterType}"`}
                    {filter === "favorites" && " de tus favoritos"}.
                    <br /><br />
                    <strong>Esta acción no se puede deshacer.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAll}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sí, eliminar todos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Resultados */}
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {searchQuery ? (
              <div className="space-y-2">
                <p className="text-sm lg:text-base">No hay resultados para &ldquo;{searchQuery}&rdquo;</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                  className="text-primary h-8 text-sm lg:text-base"
                >
                  Limpiar búsqueda
                </Button>
              </div>
            ) : (
              <p className="text-sm lg:text-base">No hay elementos guardados</p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {searchQuery && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 p-1.5 bg-muted/50 rounded-md">
                <span>
                  {filteredAndSortedItems.length} resultado{filteredAndSortedItems.length === 1 ? '' : 's'} 
                  para &ldquo;{searchQuery}&rdquo;
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                  className="h-6 px-2 text-sm"
                >
                  Limpiar
                </Button>
              </div>
            )}
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

