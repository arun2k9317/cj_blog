# OAuth Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Authentication failed" Error

This error occurs when the OAuth callback fails to exchange the authorization code for a session.

## Step-by-Step Debugging

### 1. Check Server Logs

After attempting to log in, check your terminal/console for error messages. The updated code now logs:
- OAuth initiation details
- Code exchange errors
- Specific error messages

### 2. Verify Supabase Redirect URLs

**Critical:** Supabase needs to know which URLs are allowed to receive OAuth callbacks.

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/api/auth/callback` (for development)
   - `https://nitinjamdar.in/api/auth/callback` (for production)
4. Click **Save**

**This is often the main cause of authentication failures!**

### 3. Verify Environment Variables

Check your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ncqnzkpzzcoznsdvllvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:**
- `NEXT_PUBLIC_SITE_URL` must match your actual site URL
- For production, use `https://nitinjamdar.in`
- Restart your dev server after changing environment variables

### 4. Verify Google Cloud Console Configuration

In Google Cloud Console → OAuth 2.0 Client ID:

**Authorized redirect URIs must include:**
- ✅ `https://ncqnzkpzzcoznsdvllvx.supabase.co/auth/v1/callback` (Supabase callback)
- ✅ `http://localhost:3000/api/auth/callback` (Next.js callback - development)
- ✅ `https://nitinjamdar.in/api/auth/callback` (Next.js callback - production)

**Authorized JavaScript origins should include:**
- ✅ `https://ncqnzkpzzcoznsdvllvx.supabase.co`
- ✅ `http://localhost:3000` (for development)
- ✅ `https://nitinjamdar.in` (for production)

### 5. Check Supabase Google Provider Settings

In Supabase Dashboard → Authentication → Providers → Google:

- ✅ **Enable Sign in with Google** should be ON
- ✅ **Client IDs** should match your Google Cloud Client ID
- ✅ **Client Secret** should be set correctly
- ✅ **Callback URL** should be: `https://ncqnzkpzzcoznsdvllvx.supabase.co/auth/v1/callback`

### 6. OAuth Flow Verification

The correct flow should be:

1. User clicks "Sign in with Google"
2. Client-side calls Supabase `signInWithOAuth()` directly
3. User redirected to Google OAuth consent screen
4. User authorizes → Google redirects to Supabase callback
5. Supabase processes OAuth → Redirects to your Next.js callback with code
6. Next.js `/api/auth/callback` exchanges code for session
7. User redirected to `/admin`

### 7. Common Error Messages

#### "Invalid redirect URL"
- **Cause:** The `redirectTo` URL is not in Supabase's allowed redirect URLs
- **Fix:** Add the URL in Supabase Dashboard → Authentication → URL Configuration

#### "Code exchange failed"
- **Cause:** The authorization code is invalid or expired
- **Fix:** 
  - Check that the code hasn't been used already
  - Verify the redirect URL matches exactly
  - Clear browser cookies and try again

#### "OAuth provider not enabled"
- **Cause:** Google provider not enabled in Supabase
- **Fix:** Enable it in Supabase Dashboard → Authentication → Providers → Google

#### "Invalid client credentials"
- **Cause:** Client ID or Secret mismatch between Google Cloud and Supabase
- **Fix:** Verify both match exactly

### 8. Testing Steps

1. **Clear browser cookies** for localhost:3000
2. **Restart dev server** after changing environment variables
3. **Check browser console** for client-side errors
4. **Check server terminal** for server-side errors
5. **Try incognito/private window** to rule out cookie issues

### 9. Debug Mode

The updated code now includes console logging. Check your terminal for:

```
Initiating OAuth login with redirectTo: http://localhost:3000/api/auth/callback?next=/admin
Supabase URL: https://ncqnzkpzzcoznsdvllvx.supabase.co
OAuth URL generated successfully
```

If you see errors, they will be logged with details.

### 10. Quick Checklist

- [ ] Supabase redirect URLs configured
- [ ] Google Cloud redirect URIs configured
- [ ] Google Cloud JavaScript origins configured
- [ ] Environment variables set correctly
- [ ] Supabase Google provider enabled
- [ ] Client ID matches in both places
- [ ] Client Secret matches in both places
- [ ] Dev server restarted after env changes
- [ ] Browser cookies cleared
- [ ] Checked server logs for errors

## Still Having Issues?

1. Check the detailed error message in the login page (now shows specific errors)
2. Check server terminal logs for detailed error information
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Try the OAuth flow in an incognito window
5. Check Supabase logs in the dashboard for authentication events

