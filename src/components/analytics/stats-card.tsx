"use client"

import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive?: boolean
  }
  description?: string
  className?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  delay = 0,
}: StatsCardProps) {
  const getTrendColor = () => {
    if (!trend) return ""
    if (trend.value === 0) return "text-muted-foreground"
    return trend.isPositive ? "text-green-600" : "text-red-600"
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value === 0) return <Minus className="h-4 w-4" />
    return trend.isPositive ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                  {getTrendIcon()}
                  <span className="font-medium">
                    {Math.abs(trend.value)}%
                  </span>
                  {description && (
                    <span className="text-muted-foreground">{description}</span>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  )
}
