import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/health(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/patients(.*)',
  '/doctors(.*)',
  '/appointments(.*)',
  '/billing(.*)',
  '/api/patients(.*)',
  '/api/doctors(.*)',
  '/api/appointments(.*)',
  '/api/billing(.*)',
])

// Define Clerk component routes (require auth but have special handling)
const isClerkRoute = createRouteMatcher([
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  try {
    // Allow public routes to proceed without authentication
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }

    // Handle Clerk component routes (like settings)
    if (isClerkRoute(req)) {
      const { userId } = await auth()
      if (!userId) {
        // Redirect to sign-in page with return URL
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }
      // Allow authenticated users to access Clerk routes
      return NextResponse.next()
    }

    // Protect routes that require authentication
    if (isProtectedRoute(req)) {
      const { userId } = await auth()
      if (!userId) {
        // Redirect to sign-in page with return URL
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }
    }

    // Allow other routes to proceed
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // Fallback: allow request to proceed to avoid breaking the app
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}