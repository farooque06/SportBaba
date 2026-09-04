import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname)
  const isCronRoute = nextUrl.pathname.startsWith("/api/cron")
  const isHealthRoute = nextUrl.pathname === "/api/health"
  const isPublicWebhook = nextUrl.pathname.startsWith("/api/webhooks")
  
  const userRole = (req.auth?.user as any)?.role

  // Protected paths: dashboard, admin, onboarding, player, and private APIs
  // Note: /api/cron, /api/health, and public webhooks are NOT protected by auth session
  const isProtectedPath = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname.startsWith("/admin") || 
                          nextUrl.pathname.startsWith("/onboarding") ||
                          nextUrl.pathname.startsWith("/player") ||
                          (nextUrl.pathname.startsWith("/api") && !isCronRoute && !isHealthRoute && !isPublicWebhook)

  const isPublicRoute = ["/", "/login", "/register", "/open-games"].includes(nextUrl.pathname) || 
                        nextUrl.pathname.startsWith("/icons") || 
                        nextUrl.pathname.startsWith("/images") ||
                        nextUrl.pathname.startsWith("/open-games") ||
                        isCronRoute ||
                        isHealthRoute ||
                        isPublicWebhook ||
                        (!isProtectedPath && nextUrl.pathname.length > 1)

  if (isApiAuthRoute) return undefined

  if (isAuthRoute) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl")
      if (
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        !callbackUrl.startsWith("/login") &&
        !callbackUrl.startsWith("/register")
      ) {
        return Response.redirect(new URL(callbackUrl, nextUrl))
      }
      const dest = userRole === 'player' ? "/player" : (userRole === 'superadmin' ? "/admin" : "/dashboard")
      return Response.redirect(new URL(dest, nextUrl))
    }
    return undefined
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callback = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return Response.redirect(new URL(`/login?callbackUrl=${callback}`, nextUrl))
  }

  // If a standard player attempts to navigate to /dashboard or /admin, redirect to /player
  if (isLoggedIn && userRole === 'player' && (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/admin"))) {
    return Response.redirect(new URL("/player", nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
