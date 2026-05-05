import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname)
  
  // Public routes: landing, login, register, and dynamic slug pages (storefronts)
  // We exclude /dashboard and /admin and /onboarding from being treated as storefront slugs
  const isProtectedPath = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname.startsWith("/admin") || 
                          nextUrl.pathname.startsWith("/onboarding") ||
                          nextUrl.pathname.startsWith("/api")

  const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname) || 
                        nextUrl.pathname.startsWith("/icons") || 
                        nextUrl.pathname.startsWith("/images") ||
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
