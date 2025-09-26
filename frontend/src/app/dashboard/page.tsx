'use client'

import { useHospitalAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleDashboard from '@/components/dashboard/RoleDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoaded } = useHospitalAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle authentication check
  useEffect(() => {
    // Check if we have stored authentication data
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      router.push('/auth/login');
      return;
    }

    setIsInitializing(false);
  }, [router]);

  // Redirect if not authenticated after auth is loaded
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoaded, router]);

  // Show loading while initializing or auth is loading
  if (isInitializing || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // If auth is loaded but no user, show loading (will redirect soon)
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  // Render role-specific dashboard based on user role
  return <RoleDashboard />;
}
