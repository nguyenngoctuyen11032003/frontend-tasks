"use client"

/**
 * Sort Control Component
 * UI for selecting sort field and direction
 */

import React from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SortManager, type SortConfig, type TaskSortField, type ProjectSortField } from "@/lib/sorting"

interface SortControlProps {
  type: "task" | "project"
  sortConfig: SortConfig
  onSortChange: (config: SortConfig) => void
  className?: string
}

export function SortControl({ type, sortConfig, onSortChange, className }: SortControlProps) {
  const sortFields = SortManager.getSortFields(type)

  const handleFieldChange = (field: string) => {
    onSortChange({
      ...sortConfig,
      field: field as TaskSortField | ProjectSortField,
    })
  }

  const handleDirectionToggle = () => {
    onSortChange({
      ...sortConfig,
      direction: SortManager.toggleDirection(sortConfig.direction),
    })
  }

  const currentFieldLabel = SortManager.getSortFieldLabel(sortConfig.field, type)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Desktop view - Full controls */}
      <div className="hidden md:flex items-center gap-2">
        <Select value={sortConfig.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortFields.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={handleDirectionToggle}
          aria-label={`Sắp xếp ${sortConfig.direction === "asc" ? "tăng dần" : "giảm dần"}`}
        >
          {sortConfig.direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile view - Compact popover */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sắp xếp</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sắp xếp theo</h4>
                <RadioGroup value={sortConfig.field} onValueChange={handleFieldChange}>
                  {sortFields.map((field) => (
                    <div key={field.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={field.value} id={`sort-${field.value}`} />
                      <Label htmlFor={`sort-${field.value}`} className="flex-1 cursor-pointer">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <h4 className="font-medium mb-2">Thứ tự</h4>
                <RadioGroup
                  value={sortConfig.direction}
                  onValueChange={(value) =>
                    onSortChange({ ...sortConfig, direction: value as "asc" | "desc" })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asc" id="sort-asc" />
                    <Label htmlFor="sort-asc" className="flex items-center gap-2 cursor-pointer">
                      <ArrowUp className="h-4 w-4" />
                      Tăng dần
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="desc" id="sort-desc" />
                    <Label htmlFor="sort-desc" className="flex items-center gap-2 cursor-pointer">
                      <ArrowDown className="h-4 w-4" />
                      Giảm dần
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
