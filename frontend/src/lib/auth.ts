'use client'

import { UserRole } from '@/lib/constants'
import { useState, useEffect } from 'react'

// Type definition for our hospital user data
export interface HospitalUserData {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  hospitalId?: string
  department?: string
}

// Type for authentication state
export interface AuthState {
  user: HospitalUserData | null
  isLoaded: boolean
  isSignedIn: boolean
  token: string | null
}

// Client-side authentication hooks for React components
export function useHospitalAuth(): AuthState & {
  role: UserRole
  hospitalId?: string
  department?: string
  signOut: () => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  fullName: string
  email: string
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
    token: null
  })

  useEffect(() => {
    // Initialize auth state from localStorage
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as HospitalUserData
        setAuthState({
          user,
          isLoaded: true,
          isSignedIn: true,
          token
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Invalid user data, clear storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setAuthState({
          user: null,
          isLoaded: true,
          isSignedIn: false,
          token: null
        })
      }
    } else {
      setAuthState({
        user: null,
        isLoaded: true,
        isSignedIn: false,
        token: null
      })
    }
  }, [])

  const signOut = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      isLoaded: true,
      isSignedIn: false,
      token: null
    })
  }
  
  return {
    // Auth state
    ...authState,
    
    // Hospital-specific data
    role: authState.user?.role || 'PATIENT',
    hospitalId: authState.user?.hospitalId,
    department: authState.user?.department || (authState.user?.role === 'DOCTOR' ? 'General' : undefined),
    
    // Auth actions
    signOut,
    
    // Role checking
    hasRole: (role: UserRole) => authState.user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(authState.user?.role || 'PATIENT'),
    
    // Formatted user info
    fullName: authState.user ? `${authState.user.firstName} ${authState.user.lastName}` : '',
    email: authState.user?.email || '',
  }
}

// Role checking utilities for server-side use
export const hasRole = (userRole: string, requiredRole: UserRole): boolean => {
  return userRole === requiredRole
}

export const hasAnyRole = (userRole: string, roles: UserRole[]): boolean => {
  return roles.includes(userRole as UserRole)
}

export const isAdmin = (userRole: string): boolean => {
  return userRole === 'ADMIN'
}

export const isDoctor = (userRole: string): boolean => {
  return userRole === 'DOCTOR'
}

export const isPatient = (userRole: string): boolean => {
  return userRole === 'PATIENT'
}

// Utility function to get user from token
export const getUserFromToken = (token: string): HospitalUserData | null => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    return JSON.parse(userStr) as HospitalUserData
  } catch (error) {
    console.error('Error parsing user from token:', error)
    return null
  }
}