"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCommandPalette } from "./use-command-palette"
import { toast } from "sonner"

export function useGlobalShortcuts() {
  const router = useRouter()
  const { toggle } = useCommandPalette()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
        return
      }

      // Don't handle shortcuts if user is typing in input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // G + D - Go to Dashboard
      if (e.key === "g") {
        const secondKeyPromise = new Promise<string>((resolve) => {
          const handler = (e2: KeyboardEvent) => {
            document.removeEventListener("keydown", handler)
            resolve(e2.key)
          }
          document.addEventListener("keydown", handler)
          setTimeout(() => {
            document.removeEventListener("keydown", handler)
            resolve("")
          }, 1000)
        })

        secondKeyPromise.then((secondKey) => {
          switch (secondKey) {
            case "d":
              router.push("/dashboard")
              toast.info("Đi tới Dashboard")
              break
            case "t":
              router.push("/tasks")
              toast.info("Đi tới Tasks")
              break
            case "p":
              router.push("/projects")
              toast.info("Đi tới Projects")
              break
            case "m":
              router.push("/team")
              toast.info("Đi tới Team")
              break
            case "c":
              router.push("/chat")
              toast.info("Đi tới Chat")
              break
            case "n":
              router.push("/notes")
              toast.info("Đi tới Notes")
              break
            case "r":
              router.push("/reports")
              toast.info("Đi tới Reports")
              break
          }
        })
      }

      // ? - Show keyboard shortcuts
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault()
        toast.info("Phím tắt", {
          description: "⌘K - Tìm kiếm | G+D - Dashboard | G+T - Tasks | G+P - Projects | G+M - Team | G+C - Chat | G+N - Notes | G+R - Reports",
          duration: 5000,
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router, toggle])
}
