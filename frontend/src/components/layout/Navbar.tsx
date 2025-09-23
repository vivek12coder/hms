'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { AuthButtons } from '@/components/auth/AuthComponents'
import { useHospitalAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { 
  Activity, 
  Calendar, 
  DollarSign, 
  Settings, 
  Stethoscope,
  Users 
} from 'lucide-react'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity, roles: ['admin', 'doctor', 'patient'] },
  { href: '/appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'patient'] },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin'] },
  { href: '/patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor'] },
  { href: '/billing', label: 'Billing', icon: DollarSign, roles: ['admin'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'doctor', 'patient'] },
]

export function Navbar() {
  const pathname = usePathname()
  const { role, isLoaded } = useHospitalAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't show navbar on auth pages or during hydration
  if (!isMounted || pathname?.startsWith('/sign-')) {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              HMS
            </Link>
          </div>

          {/* Navigation Links - Only show when signed in */}
          <SignedIn>
            {isLoaded && (
              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const canAccess = !role || item.roles.includes(role)
                  
                  if (!canAccess) return null

                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            )}
          </SignedIn>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  Sign in to access the hospital management system
                </p>
              </div>
            </SignedOut>
            <AuthButtons />
          </div>
        </div>

        {/* Mobile Navigation - Only show when signed in */}
        <SignedIn>
          {isLoaded && (
            <div className="md:hidden border-t py-2">
              <div className="flex flex-wrap gap-1">
                {navigationItems.map((item) => {
                  const canAccess = !role || item.roles.includes(role)
                  
                  if (!canAccess) return null

                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </nav>
  )
}