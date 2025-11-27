"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { TaskCard } from "./task-card"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus } from "@/types"

interface KanbanColumn {
  id: TaskStatus
  title: string
  color: string
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "Chờ xử lý", color: "bg-slate-500" },
  { id: "in_progress", title: "Đang thực hiện", color: "bg-blue-500" },
  { id: "review", title: "Đang review", color: "bg-amber-500" },
  { id: "done", title: "Hoàn thành", color: "bg-green-500" },
]

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void
  onAddTask?: (status: TaskStatus) => void
  className?: string
}

interface SortableTaskProps {
  task: Task
  onClick: () => void
}

function SortableTask({ task, onClick }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

interface DroppableColumnProps {
  id: TaskStatus
  children: React.ReactNode
  isOver: boolean
}

function DroppableColumn({ id, children, isOver }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl bg-muted/30 p-3 transition-all",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {children}
    </div>
  )
}

export function KanbanBoard({ tasks, onTaskClick, onTaskMove, onAddTask, className }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      setOverId(null)
      return
    }

    const activeTask = tasks.find((t) => t.id === active.id)
    const overId = over.id as string

    // Check if dropped over a column
    const targetColumn = columns.find((c) => c.id === overId)
    if (targetColumn && activeTask && activeTask.status !== targetColumn.id) {
      onTaskMove?.(activeTask.id, targetColumn.id)
    } else {
      // Check if dropped over another task
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask && activeTask && activeTask.status !== overTask.status) {
        onTaskMove?.(activeTask.id, overTask.status)
      }
    }

    setActiveTask(null)
    setOverId(null)
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    setOverId(null)
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          const isOver = overId === column.id

          return (
            <DroppableColumn key={column.id} id={column.id} isOver={isOver}>
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", column.color)} />
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddTask?.(column.id)}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Thêm công việc</span>
                </Button>
              </div>

              {/* Tasks list */}
              <SortableContext
                id={column.id}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin">
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SortableTask
                          task={task}
                          onClick={() => onTaskClick?.(task)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
                      Kéo thả công việc vào đây
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 cursor-grabbing opacity-80">
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
