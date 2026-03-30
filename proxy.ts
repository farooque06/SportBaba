import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  
  if (!isPublicRoute(request)) {
    await auth.protect();

    // Role-based redirection logic
    // We check publicMetadata.role (matches Sidebar logic) and email/ID fallbacks
    const claims = sessionClaims as any;
    const role = claims?.publicMetadata?.role || claims?.metadata?.role;
    const email = claims?.email || claims?.primary_email || claims?.primaryEmail;
    
    const isAdmin = role === 'superadmin' || 
                    email === 'far00queapril17@gmail.com' || 
                    userId === '48c52067-23b6-412c-a17b-1e7de8bc4f98';

    const url = new URL(request.url);
    if (isAdmin && url.pathname.startsWith('/dashboard')) {
      console.log(`[Middleware] Admin detected (${userId}). Redirecting to /admin`);
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};      