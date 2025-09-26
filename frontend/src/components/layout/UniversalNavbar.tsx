'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { 
  Activity, 
  DollarSign, 
  Settings, 
  Users,
  User,
  LogOut,
  Calendar,
  FileText,
  Menu,
  X
} from 'lucide-react'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity, roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
  { href: '/patients', label: 'Patients', icon: Users, roles: ['ADMIN', 'DOCTOR'] },
  { href: '/appointments/book', label: 'Book Appointment', icon: Calendar, roles: ['PATIENT'] },
  { href: '/medical-history', label: 'Medical History', icon: FileText, roles: ['PATIENT'] },
  { href: '/billing', label: 'Billing', icon: DollarSign, roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
]

interface NavItem {
  href: string
  label: string
  icon: any
  roles?: string[]
}

export function UniversalNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{name: string, email: string, role?: string} | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user') // Changed from 'userData' to 'user'
    
    console.log('Checking auth status:', { token: !!token, userData: !!userData })
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('Parsed user data:', parsedUser)
        setIsAuthenticated(true)
        setUser(parsedUser)
        return true
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user') // Changed from 'userData' to 'user'
        setIsAuthenticated(false)
        setUser(null)
        return false
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
      return false
    }
  }

  useEffect(() => {
    setIsMounted(true)
    checkAuthStatus()
  }, [])

  // Check auth status when pathname changes (helpful after login redirect)
  useEffect(() => {
    if (isMounted) {
      checkAuthStatus()
    }
  }, [pathname, isMounted])

  const handleLogout = () => {
    console.log('Logging out user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user') // Changed from 'userData' to 'user'
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth/login')
  }

  // Don't show navbar on auth pages or during hydration
  if (!isMounted || pathname?.startsWith('/auth')) {
    return null
  }

  const filteredNav: NavItem[] = navigationItems.filter(item => !item.roles || item.roles.includes(user?.role || 'PATIENT'))

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-card-glass backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Hospital MS */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-2xl font-extrabold tracking-tight text-gradient-accent"
            >
              HMS
            </Link>
            <div className="hidden sm:block">
              <span className="text-base font-semibold text-gray-700 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">Hospital MS</span>
            </div>
          </div>

          {/* Center - Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors elevate-card shadow-soft ${
                        isActive 
                          ? 'bg-blue-500 text-white hover:bg-blue-500/90' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-pink-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side - Profile and User Menu */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                {/* Mobile menu toggle */}
                <button
                  className="md:hidden inline-flex items-center justify-center ml-1 p-2 rounded-md text-gray-600 hover:bg-pink-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  onClick={() => setMobileOpen(o => !o)}
                  aria-label="Toggle navigation"
                >
                  {mobileOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
                </button>
                
                {/* User Info - Desktop */}
                <div className="hidden md:block text-right mr-3">
                  <p className="text-sm font-medium text-gray-900 uppercase">
                    {user?.role || 'USER'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email || 'user@hospital.com'}
                  </p>
                </div>
                
                {/* User Avatar - Desktop & Mobile */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-full flex items-center justify-center shadow-soft">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Logout Button - Desktop only */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 ml-2 text-gray-600 hover:text-gray-900 hover:bg-pink-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="hover:bg-pink-100 text-xs sm:text-sm px-2 sm:px-4">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-500/90 text-white shadow-soft text-xs sm:text-sm px-2 sm:px-4">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Drawer */}
        {isAuthenticated && mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 animate-in fade-in duration-200 slide-in-from-top-5 origin-top">
            <div className="grid gap-1.5 px-1 pb-3">
              {filteredNav.map(item => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-blue-500 text-white' : 'hover:bg-pink-100 text-gray-700'
                    }`}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
              
              {/* User info in mobile menu */}
              <div className="px-3 py-3 mt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.role || 'USER'}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{user?.email || 'user@hospital.com'}</p>
                  </div>
                </div>
                
                {/* Settings and Logout buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/settings" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center gap-2">
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleLogout}
                    size="sm"
                    className="w-full justify-center gap-2 bg-gradient-to-r from-pink-400 to-blue-400 text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" /> 
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}