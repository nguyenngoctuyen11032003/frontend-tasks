"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  UserPlus,
  FolderPlus,
  Edit,
  Trash2,
  Clock,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "task_completed" | "task_created" | "comment" | "user_joined" | "project_created" | "task_updated" | "task_deleted"
  user: {
    name: string
    avatar?: string
  }
  description: string
  timestamp: string
  metadata?: {
    taskTitle?: string
    projectName?: string
    priority?: string
  }
}

interface ActivityTimelineProps {
  activities: Activity[]
  maxHeight?: string
}

export function ActivityTimeline({ activities, maxHeight = "600px" }: ActivityTimelineProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "task_created":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-orange-600" />
      case "project_created":
        return <FolderPlus className="h-4 w-4 text-indigo-600" />
      case "task_updated":
        return <Edit className="h-4 w-4 text-yellow-600" />
      case "task_deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "task_completed":
        return "border-green-600"
      case "task_created":
        return "border-blue-600"
      case "comment":
        return "border-purple-600"
      case "user_joined":
        return "border-orange-600"
      case "project_created":
        return "border-indigo-600"
      case "task_updated":
        return "border-yellow-600"
      case "task_deleted":
        return "border-red-600"
      default:
        return "border-muted-foreground"
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      })
    } catch {
      return timestamp
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Lịch sử hoạt động của team</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ height: maxHeight }}>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                      getActivityColor(activity.type)
                    )}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="h-full w-0.5 bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(activity.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{" "}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                        {activity.metadata?.taskTitle && (
                          <p className="text-sm font-medium text-foreground mt-1">
                            {activity.metadata.taskTitle}
                          </p>
                        )}
                        {activity.metadata?.projectName && (
                          <Badge variant="outline" className="mt-2">
                            {activity.metadata.projectName}
                          </Badge>
                        )}
                        {activity.metadata?.priority && (
                          <Badge
                            variant={
                              activity.metadata.priority === "high" || activity.metadata.priority === "urgent"
                                ? "destructive"
                                : "secondary"
                            }
                            className="mt-2 ml-2"
                          >
                            {activity.metadata.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
