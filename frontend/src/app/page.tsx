import { AuthSection } from '@/components/auth/AuthSection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Shield, Users, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Hospital Management System
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive healthcare management platform built with modern security and HIPAA compliance
        </p>
      </div>

      {/* Authentication State */}
      <AuthSection />

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
            <CardTitle>🔒 Enhanced Security with Clerk</CardTitle>
            <CardDescription>
              This application now uses Clerk for modern, secure authentication with the following benefits:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Multi-factor authentication (MFA) support</li>
              <li>Social login providers (Google, Microsoft, etc.)</li>
              <li>Passwordless authentication options</li>
              <li>Role-based access control with hospital-specific metadata</li>
              <li>Session management and security monitoring</li>
              <li>HIPAA-compliant user data handling</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
