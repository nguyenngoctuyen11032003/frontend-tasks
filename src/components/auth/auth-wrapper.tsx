"use client"

import { useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: ReactNode
}

/**
 * Client-side auth wrapper that:
 * 1. Restores auth state from localStorage (Zustand persist)
 * 2. Redirects unauthenticated users to login
 * 3. Validates permissions for protected routes
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/accept-invite', '/callback', '/auth-callback']
  
  // Routes that require specific permissions
  const protectedRoutes: Record<string, string> = {
    '/admin': 'users.manage',
    '/reports': 'reports.view',
    '/team': 'team.view',
  }

  useEffect(() => {
    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    if (isPublicRoute) {
      // Public routes are always accessible
      return
    }

    // For protected routes, check auth state
    // Note: isAuthenticated may be false on first mount because Zustand persist is async
    // Give it a moment to rehydrate before redirecting
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // Check specific route permissions
      for (const [route, permission] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
          // Super admin bypass
          if (user?.roles?.includes('super_admin')) {
            return
          }

          // Check if user has required permission
          const hasPermission = user?.permissions?.includes(permission as any)
          
          if (!hasPermission) {
            // No permission, redirect to dashboard
            router.push('/dashboard')
            return
          }
        }
      }
    }, 100) // Give time for Zustand to rehydrate from localStorage

    return () => clearTimeout(timer)
  }, [pathname, isAuthenticated, user, router])

  // Show loading while auth state is being restored
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (!isPublicRoute && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang khôi phục phiên đăng nhập...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
