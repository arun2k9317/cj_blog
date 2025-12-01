import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin-users'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow access to login page without authentication
  if (pathname === '/admin/login') {
    // If user is authenticated AND authorized, redirect away from login page
    if (user && isAdminEmail(user.email)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.searchParams.delete('error') // Remove any error params
      return NextResponse.redirect(url)
    }
    // Allow unauthenticated users OR unauthorized users to access login page
    // (Unauthorized users should see the error message)
    // Set a header so the layout knows we're on login page
    supabaseResponse.headers.set('x-admin-login-page', 'true')
    return supabaseResponse
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Check if user is in admin whitelist (if whitelist is configured)
    if (!isAdminEmail(user.email)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

