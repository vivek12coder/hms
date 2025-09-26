'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/constants';
import { getUserFromToken } from '@/lib/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackComponent?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackComponent = null 
}: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const user = getUserFromToken(token);
        if (!user || !user.role) {
          router.push('/auth/login');
          return;
        }

        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          // Redirect to dashboard if not authorized
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Authorization error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthLayout({ children, requireAuth = true }: AuthLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        if (requireAuth && !token) {
          router.push('/auth/login');
          return;
        }

        if (token) {
          const user = getUserFromToken(token);
          if (user) {
            setIsAuthenticated(true);
          } else if (requireAuth) {
            router.push('/auth/login');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (requireAuth) {
          router.push('/auth/login');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}