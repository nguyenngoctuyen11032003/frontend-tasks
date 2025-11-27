"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface TaskCompletionChartProps {
  data: Array<{
    name: string
    completed: number
    inProgress: number
    todo: number
  }>
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiến độ công việc</CardTitle>
        <CardDescription>Thống kê công việc theo tuần</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar
              dataKey="completed"
              name="Hoàn thành"
              fill="hsl(142, 76%, 36%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              name="Đang làm"
              fill="hsl(221, 83%, 53%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="todo"
              name="Chưa làm"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
