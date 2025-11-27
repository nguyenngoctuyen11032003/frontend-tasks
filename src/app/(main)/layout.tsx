"use client"
import { AppLayout } from "@/components/layout/app-layout"
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts"
import type React from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useGlobalShortcuts()
  
  return <AppLayout>{children}</AppLayout>
}
