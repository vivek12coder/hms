'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import { AuthButtons, WelcomeCard } from '@/components/auth/AuthComponents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export function AuthSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we load the authentication status
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SignedOut>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to HMS</CardTitle>
            <CardDescription className="text-center">
              Please sign in to access the hospital management system
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AuthButtons />
          </CardContent>
        </Card>
      </SignedOut>

      <SignedIn>
        <WelcomeCard />
      </SignedIn>
    </div>
  )
}