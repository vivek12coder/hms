'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthButtons() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side mount
  if (!isMounted) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" disabled>
          Loading...
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline">Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-8 w-8"
            }
          }}
        />
      </SignedIn>
    </div>
  )
}

export function WelcomeCard() {
  const { user, isLoaded } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch and ensure user data is loaded
  if (!isMounted || !isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we load your information
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <SignedIn>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user?.firstName}!</CardTitle>
          <CardDescription>
            Role: {(user?.publicMetadata?.role as string) || 'Not assigned'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hospital ID: {(user?.publicMetadata?.hospitalId as string) || 'Not assigned'}
          </p>
        </CardContent>
      </Card>
    </SignedIn>
  )
}

export function RoleGuard({ 
  allowedRoles, 
  children 
}: { 
  allowedRoles: string[], 
  children: React.ReactNode 
}) {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this resource.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <>{children}</>
}