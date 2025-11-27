"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActivityFeed } from "@/components/layout/activity-feed"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

interface RightPanelProps {
  className?: string
}

export function RightPanel({ className }: RightPanelProps) {
  const { rightPanelOpen, rightPanelContent, closeRightPanel } = useUIStore()

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRightPanel}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-full border-l bg-background shadow-lg md:top-16 md:h-[calc(100vh-4rem)] md:w-96",
              className,
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <h3 className="font-semibold">
                    {rightPanelContent ? "Chi tiết" : "Hoạt động"}
                  </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={closeRightPanel}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Đóng</span>
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {rightPanelContent || <ActivityFeed />}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
