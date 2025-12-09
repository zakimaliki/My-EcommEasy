import { NextResponse } from 'next/server';

export function middleware() {
  // Middleware untuk Next.js
  // Note: Actual auth protection dilakukan di client-side via React Context
  // Karena kami menggunakan localStorage (client-side) bukan cookies (server-side)
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
