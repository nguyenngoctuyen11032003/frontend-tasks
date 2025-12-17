// This file is deprecated and replaced with proxy configuration in next.config.ts
// Authentication is now handled client-side using Zustand store and PermissionGuard

// Public routes are defined in next.config.ts and handled via beforeFiles hook
// For backwards compatibility, keep this file but mark as deprecated

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * @deprecated Use proxy configuration in next.config.ts instead
 * Auth is now handled client-side with PermissionGuard component
 */
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

