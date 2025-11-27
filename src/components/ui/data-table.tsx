"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  pageSize?: number
  className?: string
}

type SortDirection = "asc" | "desc" | null

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  onSelectionChange,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map((c) => c.key)))

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortKey(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(data.map(keyExtractor))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
    onSelectionChange?.(Array.from(newSelection))
  }

  const toggleColumnVisibility = (key: string) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(key)) {
      if (newVisible.size > 1) {
        newVisible.delete(key)
      }
    } else {
      newVisible.add(key)
    }
    setVisibleColumns(newVisible)
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0
    const aVal = (a as Record<string, unknown>)[sortKey]
    const bVal = (b as Record<string, unknown>)[sortKey]
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const visibleColumnsList = columns.filter((c) => visibleColumns.has(c.key))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Column visibility toggle */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Cột hiển thị
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.has(column.key)}
                onCheckedChange={() => toggleColumnVisibility(column.key)}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedIds.size === data.length && data.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </th>
                )}
                {visibleColumnsList.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && "cursor-pointer select-none hover:text-foreground",
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && sortKey === column.key && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedData.map((item, index) => {
                  const id = keyExtractor(item)
                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "border-t transition-colors hover:bg-muted/50",
                        selectedIds.has(id) && "bg-primary/5",
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.has(id)}
                            onCheckedChange={() => toggleSelect(id)}
                            aria-label={`Chọn dòng ${id}`}
                          />
                        </td>
                      )}
                      {visibleColumnsList.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm">
                          {column.render
                            ? column.render(item)
                            : String((item as Record<string, unknown>)[column.key] ?? "")}
                        </td>
                      ))}
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, data.length)} trong{" "}
            {data.length} kết quả
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
