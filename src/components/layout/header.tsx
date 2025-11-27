"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Menu, LogOut, Settings, User, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useCommandPalette } from "@/hooks/use-command-palette"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"
import { useDebouncedCallback } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const { setOpen: setCommandPaletteOpen } = useCommandPalette()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [hasScrolled, setHasScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Debounced search handler
  const handleSearchDebounced = useDebouncedCallback((query: string) => {
    // Perform search logic here
    console.log("Searching for:", query)
  }, 300)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    handleSearchDebounced(value)
  }, [handleSearchDebounced])

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-3 transition-shadow duration-200 md:h-16 md:px-6",
        hasScrolled && "shadow-md",
        className,
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden h-9 w-9" aria-label="Mở menu">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs md:text-sm font-bold text-primary-foreground">TM</span>
          </div>
          <span className="hidden text-base md:text-lg font-semibold lg:inline">TaskMaster</span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 px-2 md:px-4 lg:max-w-md lg:px-8" role="search" aria-label="Tìm kiếm">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm người dùng, dự án, công việc..."
                className="pl-9 pr-9"
                aria-label="Tìm kiếm người dùng, dự án, công việc"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery("")
                }}
                aria-label="Đóng tìm kiếm"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-muted-foreground bg-transparent"
                onClick={() => setCommandPaletteOpen(true)}
                aria-label="Mở tìm kiếm"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Tìm kiếm...</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium sm:flex">
                  ⌘K
                </kbd>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        
        {/* Notifications */}
        <NotificationCenter />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full" aria-label="Menu người dùng">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name || "Avatar người dùng"} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || "Người dùng"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings?tab=system" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
