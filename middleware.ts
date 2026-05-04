import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth callback route - let it through
  if (pathname.startsWith('/auth/callback')) {
    return await updateSession(request);
  }

  // Login page - always accessible
  if (pathname === '/login') {
    return await updateSession(request);
  }

  // Admin login page - always accessible
  if (pathname === '/admin/login') {
    return await updateSession(request);
  }

  // Admin routes - require auth
  if (pathname.startsWith('/admin')) {
    const supabaseResponse = await updateSession(request);

    // Check if user is authenticated
    const hasSessionCookie = request.cookies.has('sb-rygxbkzyonolbdkpbxfk-auth-token');

    if (!hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return Response.redirect(url);
    }

    return supabaseResponse;
  }

  // Game routes - require auth
  if (pathname.startsWith('/game')) {
    const supabaseResponse = await updateSession(request);

    const hasSessionCookie = request.cookies.has('sb-rygxbkzyonolbdkpbxfk-auth-token');

    if (!hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return Response.redirect(url);
    }

    return supabaseResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/game/:path*',
    '/auth/:path*',
    '/admin/:path*',
    '/login',
  ],
};