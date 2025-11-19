/**
 * Next.js Middleware
 * Handles request validation, CORS, and security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers (adjust as needed for your use case)
  const origin = request.headers.get('origin');
  // In production, you should whitelist specific origins
  if (origin && process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Rate limiting consideration: Add rate limiting here if needed
  // For production, consider using a service like Upstash Redis

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/api/:path*',
    // Add other paths if needed
  ],
};

