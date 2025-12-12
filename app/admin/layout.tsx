import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { isAdminEmail } from '@/lib/admin-users'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're on the login page (set by middleware)
  const headersList = await headers()
  const isLoginPage = headersList.get('x-admin-login-page') === 'true'
  
  // If it's the login page, skip auth check (middleware handles it)
  if (isLoginPage) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Bypass auth in development environment
    if (process.env.NODE_ENV === 'development') {
      return <>{children}</>
    }
    redirect('/admin/login')
  }

  if (!isAdminEmail(user.email)) {
    redirect('/admin/login?error=unauthorized')
  }

  return <>{children}</>
}

