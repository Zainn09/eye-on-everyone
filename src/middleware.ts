import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const publicPaths = ["/login", "/signup", "/waiting-approval", "/share"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn) {
    const status = req.auth?.user?.status

    // Redirect pending/rejected users away from protected pages
    if (status === "PENDING_APPROVAL" || status === "REJECTED") {
      if (!pathname.startsWith("/waiting-approval")) {
        return NextResponse.redirect(new URL("/waiting-approval", req.url))
      }
      return NextResponse.next()
    }

    // Active users redirected away from auth pages
    if (pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
}
