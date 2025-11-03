'use client'

import { useState, useEffect } from 'react'
import { useFormFeedback } from '@/lib/hooks/useFormFeedback'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient, ApiResponse } from '@/lib/api-client'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  // useFormFeedback provides loading, error & rate-limit metadata
  const { loading: submitting, error, attemptsRemaining, retryAfter, locked, execute } = useFormFeedback()

  // Check for registration success message
  useEffect(() => {
    const registered = searchParams.get('registered')
    const expired = searchParams.get('expired')
    
    if (registered === 'true') {
      toast.success('Welcome!', {
        description: 'Your account has been created successfully. Please login to continue.',
        duration: 4000,
      })
    }
    
    if (expired === 'true') {
      toast.error('Session Expired', {
        description: 'Your session has expired. Please login again to continue.',
        duration: 5000,
      })
    }
  }, [searchParams])

  // Simple countdown for rate limit retry (client-side only; not perfectly accurate but good UX)
  // Local countdown mirror if backend provided retryAfter
  const [countdown, setCountdown] = useState<number | null>(null)
  useEffect(() => {
    if (retryAfter) setCountdown(retryAfter)
  }, [retryAfter])
  useEffect(() => {
    if (countdown && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await execute(() => apiClient.login(formData.email, formData.password))
      
      if (response && response.success) {
        // Store auth token and user data in correct format for auth hook
        localStorage.setItem('authToken', response.data?.token || '')
        
        // Store user data in the format expected by useHospitalAuth hook
        const userData = {
          id: response.data?.user?.id || '',
          email: response.data?.user?.email || '',
          firstName: response.data?.user?.firstName || '',
          lastName: response.data?.user?.lastName || '',
          role: response.data?.user?.role || ''
          // hospitalId and department are not provided by backend yet
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Force page reload to trigger auth state update
        window.location.href = '/dashboard'
      } else {
        // execute already handled error state
      }
    } catch (error) {
      // Swallow; hook already set error state
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hospital MS</h1>
          <p className="mt-2 text-gray-600">Hospital Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your hospital management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="ml-2 text-sm text-red-800">{error}{countdown ? ` (retry in ${countdown}s)` : ''}{attemptsRemaining != null && !countdown ? ` (Attempts left: ${attemptsRemaining})` : ''}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={submitting || locked}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={submitting || locked}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || locked}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  locked ? `Please wait...` : 'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}