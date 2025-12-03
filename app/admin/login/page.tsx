'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Container, Title, Text, Paper, Alert, Group } from '@mantine/core'
import { IconAlertCircle, IconLogout } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase-client'
import { isAdminEmail } from '@/lib/admin-users'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in AND authorized
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || null)
        // Only redirect if user is authorized (unauthorized users should see error message)
        if (isAdminEmail(user.email)) {
          router.push('/admin')
        }
      }
    })

    // Check for error in URL params
    const errorParam = searchParams.get('error')
    const errorDetails = searchParams.get('details')
    if (errorParam === 'auth_failed') {
      const message = errorDetails 
        ? `Authentication failed: ${errorDetails}`
        : 'Authentication failed. Please try again.'
      setError(message)
    } else if (errorParam === 'unauthorized') {
      setError('You are not authorized to access the admin panel. Please contact an administrator if you believe this is an error.')
    }
  }, [router, searchParams, supabase])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use client-side Supabase to initiate OAuth
      // This ensures PKCE code_verifier is stored in browser cookies
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/admin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('OAuth initiation error:', error)
        setError(error.message)
        setLoading(false)
      } else if (data?.url) {
        // Redirect to Google OAuth
        window.location.href = data.url
      } else {
        setError('Failed to generate OAuth URL')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setError(null)
      setUserEmail(null)
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Container size="xs" style={{ marginTop: '10vh' }}>
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} mb="md" ta="center">
          Admin Login
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          Sign in with your Google account to access the admin panel
        </Text>
        
        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Error"
            color="red"
            mb="xl"
          >
            {error}
            {userEmail && (
              <Text size="sm" mt="xs" c="dimmed">
                Signed in as: {userEmail}
              </Text>
            )}
          </Alert>
        )}

        {userEmail && !isAdminEmail(userEmail) && (
          <Group justify="center" mb="md">
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Sign out and try different account
            </Button>
          </Group>
        )}

        <Button
          fullWidth
          size="md"
          onClick={handleGoogleLogin}
          loading={loading}
          variant="filled"
          disabled={!!userEmail && !isAdminEmail(userEmail)}
        >
          {userEmail && !isAdminEmail(userEmail) 
            ? 'Please sign out to try a different account'
            : 'Sign in with Google'}
        </Button>
      </Paper>
    </Container>
  )
}

