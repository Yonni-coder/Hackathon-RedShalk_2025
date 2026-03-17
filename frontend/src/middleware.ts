import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/"]
const authOnlyRoutes = ["/manage", "/ressources", "/reservations"]
const guestOnlyRoutes = ["/sign-in", "/sign-up"]

const isRouteOrSubpath = (path: string, route: string) =>
  path === route || path.startsWith(route + "/")

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const path = req.nextUrl.pathname
  const url = req.nextUrl.clone()

  if (token && guestOnlyRoutes.includes(path as any)) {
    url.pathname = "/"
    url.searchParams.set("error", "already_logged_in")
    return NextResponse.redirect(url)
  }

  const isAuthOnlyRoute = (currentPath: string) =>
    authOnlyRoutes.some(route => isRouteOrSubpath(currentPath, route))

  if (!token && isAuthOnlyRoute(path)) {
    url.pathname = "/sign-in"
    url.searchParams.set("error", "unauthorized")
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
}
