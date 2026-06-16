import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname)
  const isCronRoute = nextUrl.pathname.startsWith("/api/cron")
  const isHealthRoute = nextUrl.pathname === "/api/health"
  const isPublicWebhook = nextUrl.pathname.startsWith("/api/webhooks")
  
  // Protected paths: dashboard, admin, onboarding, and private APIs
  // Note: /api/cron, /api/health, and public webhooks are NOT protected by auth session
  const isProtectedPath = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname.startsWith("/admin") || 
                          nextUrl.pathname.startsWith("/onboarding") ||
                          (nextUrl.pathname.startsWith("/api") && !isCronRoute && !isHealthRoute && !isPublicWebhook)

  const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname) || 
                        nextUrl.pathname.startsWith("/icons") || 
                        nextUrl.pathname.startsWith("/images") ||
                        isCronRoute ||
                        isHealthRoute ||
                        isPublicWebhook ||
                        (!isProtectedPath && nextUrl.pathname.length > 1)

  if (isApiAuthRoute) return undefined

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl))
    }
    return undefined
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return undefined
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
