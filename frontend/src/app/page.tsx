'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Shield, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (token) {
      // Redirect to dashboard if already logged in
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Hospital Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive healthcare management platform built with modern security and HIPAA compliance
          </p>
          
          {/* Call to Action */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/auth/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Create Account</Button>
            </Link>
          </div>
        </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patient Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comprehensive patient management with medical records and treatment history
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Efficient appointment scheduling and management system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Role-based access control for doctors, nurses, and administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              HIPAA Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Secure authentication and audit logging for healthcare compliance
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Security Note */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>🔒 Enhanced Security & Features</CardTitle>
              <CardDescription>
                This application provides comprehensive hospital management with the following security features:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Secure JWT-based authentication</li>
                <li>Role-based access control (Admin, Doctor, Patient)</li>
                <li>Comprehensive audit logging for HIPAA compliance</li>
                <li>Real-time dashboard with database integration</li>
                <li>Patient management and billing system</li>
                <li>Secure API endpoints with input validation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
