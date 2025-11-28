import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isPublicPage = nextUrl.pathname.startsWith('/public');
  
  if (isAuthPage) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/';
      return NextResponse.redirect(new URL(callbackUrl, nextUrl));
    }
    return NextResponse.next();
  }
  
  if (!isLoggedIn && !isPublicPage) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.svg|.*\.ico|.*\.css|.*\.js|.*\.woff|.*\.woff2|.*\.ttf|.*\.eot|.*\.pdf|robots.txt|sitemap.xml).*)',
  ],
};
