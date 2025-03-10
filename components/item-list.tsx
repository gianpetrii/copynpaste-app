"use client"

import { useState } from "react"
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

  const filteredAndSortedItems = items
    .filter((item) => {
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

  return (
    <div className="p-4">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md p-3 mb-2">
        <div className="flex justify-end mb-4">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "modified")}>
            <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Más reciente" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectItem value="newest">Más reciente</SelectItem>
              <SelectItem value="oldest">Más antiguo</SelectItem>
              <SelectItem value="modified">Última modificación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay elementos guardados</div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

