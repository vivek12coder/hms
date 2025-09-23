'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import { UserRole } from '@/lib/constants'
import { useState, useEffect } from 'react'

// Type definition for our hospital user data stored in Clerk metadata
export interface HospitalUserData {
  role: UserRole
  hospitalId?: string
  department?: string
}

// Client-side authentication hooks for React components
export function useHospitalAuth() {
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, signOut, isLoaded: authLoaded } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const hospitalData = user?.publicMetadata as HospitalUserData | undefined
  
  return {
    // User data
    user,
    isSignedIn,
    isLoaded: isMounted && userLoaded && authLoaded,
    
    // Hospital-specific data
    role: hospitalData?.role,
    hospitalId: hospitalData?.hospitalId,
    department: hospitalData?.department,
    
    // Auth actions
    signOut,
    
    // Role checking
    hasRole: (role: UserRole) => hospitalData?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(hospitalData?.role || '' as UserRole),
    
    // Formatted user info
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.primaryEmailAddress?.emailAddress || '',
  }
}

// Server-side authentication utilities (for API routes and server components)
export const authUtils = {
  // These functions are now handled by Clerk's built-in components and hooks
  // No longer needed: login, register, setAuth, getToken, etc.
  
  // Legacy compatibility (deprecated - use Clerk hooks instead)
  isAuthenticated: (): boolean => {
    console.warn('authUtils.isAuthenticated is deprecated. Use useAuth hook from @clerk/nextjs instead.')
    return false // Server-side check not available in client utils
  },

  hasRole: (role: UserRole): boolean => {
    console.warn('authUtils.hasRole is deprecated. Use useHospitalAuth hook instead.')
    return false // Server-side check not available in client utils
  },
}

// Backward compatibility (deprecated)
export const authService = {
  login: async (): Promise<never> => {
    throw new Error('authService.login is deprecated. Use Clerk SignIn component or signIn from @clerk/nextjs instead.')
  },

  register: async (): Promise<never> => {
    throw new Error('authService.register is deprecated. Use Clerk SignUp component or signUp from @clerk/nextjs instead.')
  },

  logout: () => {
    console.warn('authService.logout is deprecated. Use signOut from @clerk/nextjs instead.')
    // Legacy support - redirect to sign out
    window.location.href = '/sign-in'
  },

  getUser: () => {
    console.warn('authService.getUser is deprecated. Use useUser hook from @clerk/nextjs instead.')
    return null
  },

  getToken: () => {
    console.warn('authService.getToken is deprecated. Use getToken from @clerk/nextjs instead.')
    return null
  },

  setAuth: () => {
    console.warn('authService.setAuth is deprecated. Clerk handles authentication automatically.')
  },

  isAuthenticated: () => {
    console.warn('authService.isAuthenticated is deprecated. Use isSignedIn from @clerk/nextjs instead.')
    return false
  },

  hasRole: () => {
    console.warn('authService.hasRole is deprecated. Use useHospitalAuth hook instead.')
    return false
  },
}

export default authService