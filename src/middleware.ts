import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Export a middleware function that uses NextAuth's withAuth
export default withAuth(
  // This function runs after authentication checks
  function middleware(request) {
    const { nextUrl } = request;
    const token = request.nextauth?.token;
    const path = nextUrl.pathname;
    
    // If a user with a valid session tries to access login page, redirect to dashboard
    if (path === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Check admin route access - only users with 'Gerente' role can access
    if (path.startsWith('/dashboard/admin')) {
      // Check if user has the required role
      const userRole = token?.role as string;
      
      if (userRole !== 'Gerente') {
        console.log(`Unauthorized admin access attempt: ${token?.email}, role: ${userRole}`);
        // Redirect to dashboard with unauthorized message
        return NextResponse.redirect(new URL('/dashboard?unauthorized=true', request.url));
      }
    }
    
    // For all other routes, just continue
    return NextResponse.next();
  },
  {
    callbacks: {
      // Determine if the request should be authenticated
      authorized({ token, req }) {
        const path = req.nextUrl.pathname;
        
        // Require authentication for dashboard routes
        if (path.startsWith('/dashboard')) {
          return !!token;
        }
        
        // Don't require authentication for login page
        if (path === '/login') {
          // We'll handle redirection in the middleware function if token exists
          return true;
        }
        
        // Don't require authentication for other routes
        return true;
      },
    },
    pages: {
      // Where to redirect when not authorized
      signIn: '/login',
    },
  }
);

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    // Protected routes that need authentication
    '/dashboard/:path*',
    // Login page for redirect if already logged in
    '/login'
  ],
};

