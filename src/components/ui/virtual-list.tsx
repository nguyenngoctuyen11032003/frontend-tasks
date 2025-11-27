"use client"

import { memo } from "react"
import { useVirtualScroll } from "@/hooks/use-performance"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  overscan?: number
  className?: string
}

/**
 * Virtual scrolling list component for better performance with large datasets
 * Only renders visible items + overscan buffer
 * 
 * @example
 * <VirtualList
 *   items={tasks}
 *   itemHeight={80}
 *   containerHeight={600}
 *   renderItem={(task) => <TaskCard task={task} />}
 *   keyExtractor={(task) => task.id}
 * />
 */
function VirtualListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 3,
  className,
}: VirtualListProps<T>) {
  const { visibleItems, containerProps, itemProps, totalHeight } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight,
    overscan,
  })

  return (
    <div {...containerProps} className={className}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ item, index }) => (
          <div key={keyExtractor(item, index)} {...itemProps(index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent

/**
 * Virtual grid component for grid layouts
 */
interface VirtualGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  containerHeight: number
  gap?: number
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
}

function VirtualGridComponent<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 16,
  renderItem,
  keyExtractor,
  className,
}: VirtualGridProps<T>) {
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap))
  const rowHeight = itemHeight + gap

  // Group items into rows
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += columnsCount) {
    rows.push(items.slice(i, i + columnsCount))
  }

  const { visibleItems, containerProps, itemProps, totalHeight } = useVirtualScroll({
    items: rows,
    itemHeight: rowHeight,
    containerHeight,
    overscan: 2,
  })

  return (
    <div {...containerProps} className={className}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ item: row, index: rowIndex }) => (
          <div
            key={`row-${rowIndex}`}
            {...itemProps(rowIndex)}
            style={{
              ...itemProps(rowIndex).style,
              display: "flex",
              gap: gap,
            }}
          >
            {row.map((item, colIndex) => {
              const index = rowIndex * columnsCount + colIndex
              return (
                <div
                  key={keyExtractor(item, index)}
                  style={{ width: itemWidth, height: itemHeight }}
                >
                  {renderItem(item, index)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export const VirtualGrid = memo(VirtualGridComponent) as typeof VirtualGridComponent
