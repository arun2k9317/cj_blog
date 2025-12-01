import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: code?.substring(0, 20) + '...',
      })
      return NextResponse.redirect(`${origin}/admin/login?error=auth_failed&details=${encodeURIComponent(error.message)}`)
    }
    
    if (data?.session) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  console.error('No code provided in callback')
  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}

