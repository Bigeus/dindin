import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/login", "/register-transaction", "/forgot-password", "/registration"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("dindin_auth_token")
  const { pathname } = request.nextUrl

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Se for uma rota protegida e não tiver token, redirecionar para login
  if (!isPublicRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Se for a rota de login e já tiver token, redirecionar para dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/main", request.url))
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

