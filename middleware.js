import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Skip API routes and public assets
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Check admin existence
  if (pathname !== '/auth/setup-admin') {
    try {
      const adminCheck = await fetch(
        new URL('/api/admin-exists', req.url)
      );
      
      if (!adminCheck.ok) {
        throw new Error('Admin check failed');
      }
      
      const { exists } = await adminCheck.json();
      
      if (!exists) {
        return NextResponse.redirect(
          new URL('/auth/setup-admin', req.url)
        );
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect('/500');
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login', req.url)
      );
    }
    
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}