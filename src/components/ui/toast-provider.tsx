"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "bg-background text-foreground border border-border",
        duration: 4000,
      }}
      richColors
      closeButton
    />
  )
}
