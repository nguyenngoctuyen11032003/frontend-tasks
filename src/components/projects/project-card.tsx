"use client"

import { memo, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Calendar, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { mockUsers } from "@/mocks/data"
import type { Project } from "@/types"

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  className?: string
}

export const ProjectCard = memo(function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const formatDeadline = useMemo(() => {
    const date = new Date(project.deadline)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }, [project.deadline])

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [])

  const progressColor = useMemo(() => {
    const progress = project.progress
    if (progress >= 75) return "bg-green-500"
    if (progress >= 50) return "bg-blue-500"
    if (progress >= 25) return "bg-amber-500"
    return "bg-slate-400"
  }, [project.progress])

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={handleMenuClick}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem>Sao chép</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tiến độ</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", progressColor)}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Members */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((memberId) => {
              const member = mockUsers.find(u => u.id === memberId)
              if (!member) return null
              return (
                <Avatar key={memberId} className="h-7 w-7 border-2 border-card">
                  <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              )
            })}
            {project.members.length > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{project.members.length} thành viên</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDeadline}
        </div>
      </div>
    </motion.div>
  )
})
