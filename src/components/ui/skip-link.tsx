"use client"

import { cn } from "@/lib/utils"

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "fixed left-4 top-4 z-[100] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0",
        className,
      )}
    >
      {children}
    </a>
  )
}
