# Authentication Setup Guide

This project uses Supabase Auth with Google OAuth for admin authentication.

## Prerequisites

1. A Supabase project (already set up)
2. A Google Cloud Console project with OAuth credentials

## Step 1: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click to enable it
4. You'll need to create OAuth credentials in Google Cloud Console (see Step 2)
5. Enter your **Client ID** and **Client Secret** from Google Cloud Console
6. Save the configuration

## Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name
   - **Authorized redirect URIs**: Add these:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - `http://localhost:3000/api/auth/callback` (for local development)
     - `https://yourdomain.com/api/auth/callback` (for production)
7. Copy the **Client ID** and **Client Secret**

## Step 3: Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your production URL in production
```

## Step 4: Configure Admin Users (Optional)

By default, any authenticated Google user can access the admin panel. To restrict access to specific users:

1. Open `lib/admin-users.ts`
2. Add allowed email addresses to the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = ["admin@example.com", "another-admin@example.com"];
```

If the array is empty, all authenticated users can access the admin panel.

## Step 5: Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. You should be redirected to `/admin/login`
4. Click "Sign in with Google"
5. Complete the Google OAuth flow
6. You should be redirected back to `/admin`

## Troubleshooting

### "Authentication failed" error

- Check that Google OAuth is enabled in Supabase
- Verify your Google OAuth credentials are correct
- Ensure redirect URIs are properly configured in Google Cloud Console

### "Unauthorized" error

- Check that your email is in the `ADMIN_EMAILS` array (if configured)
- Verify you're using the correct Google account

### Redirect loop

- Clear your browser cookies
- Check that `NEXT_PUBLIC_SITE_URL` matches your actual site URL
- Verify the callback URL in Supabase matches your redirect URI

## Production Deployment

1. Update `NEXT_PUBLIC_SITE_URL` to your production domain
2. Add your production callback URL to Google Cloud Console:
   - `https://yourdomain.com/api/auth/callback`
3. Ensure Supabase redirect URL includes your production domain
4. Test the authentication flow in production

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables in your deployment platform (Vercel, etc.)
- Consider implementing rate limiting for the login endpoint
- Regularly review and update the admin users list
- Use HTTPS in production
