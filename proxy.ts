import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isAdmin = user?.email === process.env.ADMIN_EMAIL

  const protectedPaths = ['/dashboard', '/credits', '/jobs', '/admin']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  // Giriş yapılmamış → login'e
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Admin login/register'dan gelince → /admin
    if (path === '/login' || path === '/register') {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    }

    // Admin /dashboard veya /credits'e girmeye çalışırsa → /admin'e
    if (isAdmin && (path.startsWith('/dashboard') || path.startsWith('/credits') || path.startsWith('/jobs'))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Normal kullanıcı /admin'e girmeye çalışırsa → /dashboard'a
    if (!isAdmin && path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
