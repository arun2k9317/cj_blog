# Vercel Deployment Guide for OAuth

This guide helps you configure OAuth authentication for your Vercel deployments.

## Quick Fix for Current Issue

Your Vercel deployment URL `https://cj-blog-ncpbpttyk-arun-ss-projects-9a5ef14e.vercel.app` is not configured in Google Cloud Console or Supabase, causing OAuth to fail.

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (cjBlog)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID: `577545405710-kbhihuvs6mr74in2mhk51v1f0msnsvgs.apps.googleusercontent.com`

5. **Add to Authorized JavaScript origins:**
   - Click **+ Add URI**
   - Add: `https://cj-blog-ncpbpttyk-arun-ss-projects-9a5ef14e.vercel.app`
   - Click **Save**

6. **Add to Authorized redirect URIs:**
   - Click **+ Add URI** in the "Authorized redirect URIs" section
   - Add: `https://cj-blog-ncpbpttyk-arun-ss-projects-9a5ef14e.vercel.app/api/auth/callback`
   - Click **Save**

### Step 2: Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   - `https://cj-blog-ncpbpttyk-arun-ss-projects-9a5ef14e.vercel.app/api/auth/callback`
5. Click **Save**

### Step 3: Verify Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ncqnzkpzzcoznsdvllvx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
5. If you added/updated variables, trigger a new deployment

### Step 4: Test

1. Clear your browser cookies
2. Visit: `https://cj-blog-ncpbpttyk-arun-ss-projects-9a5ef14e.vercel.app/admin`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected back to `/admin` successfully

## Managing Multiple Vercel Preview URLs

Each Vercel preview deployment gets a unique URL. You have two options:

### Option 1: Add Each Preview URL Individually

- Add each preview URL to Google Cloud Console as it's created
- Add each preview URL to Supabase redirect URLs

### Option 2: Use Wildcard Pattern (Recommended for Development)

Some OAuth providers support wildcards. Check if Google Cloud Console allows:
- `https://*.vercel.app` for JavaScript origins
- `https://*.vercel.app/api/auth/callback` for redirect URIs

**Note:** Wildcards may not be supported by all OAuth providers. Check Google Cloud Console documentation.

## Production Domain Setup

When you're ready to use your custom domain (e.g., `nitinjamdar.in`):

1. **Google Cloud Console:**
   - Add `https://nitinjamdar.in` to Authorized JavaScript origins
   - Add `https://nitinjamdar.in/api/auth/callback` to Authorized redirect URIs

2. **Supabase:**
   - Add `https://nitinjamdar.in/api/auth/callback` to Redirect URLs

3. **Vercel:**
   - Add your custom domain in Vercel project settings
   - Ensure environment variables are set for production

## Troubleshooting

### Error: "ERR_CONNECTION_REFUSED" for localhost:3000

**Cause:** OAuth is trying to redirect to localhost instead of your Vercel URL.

**Fix:** 
- Ensure your Vercel URL is in Google Cloud Console's authorized redirect URIs
- Ensure your Vercel URL is in Supabase's redirect URLs
- Clear browser cookies and try again

### Error: "Invalid redirect URL"

**Cause:** The callback URL is not in Supabase's allowed redirect URLs.

**Fix:**
- Add the exact URL to Supabase Dashboard → Authentication → URL Configuration
- Make sure there are no trailing slashes
- Use `https://` (not `http://`) for production

### Error: "OAuth provider not enabled"

**Cause:** Google OAuth is not enabled in Supabase.

**Fix:**
- Go to Supabase Dashboard → Authentication → Providers → Google
- Enable "Sign in with Google"
- Verify Client ID and Client Secret match Google Cloud Console

## Checklist

Before deploying to Vercel, ensure:

- [ ] Google Cloud Console has your Vercel URL in Authorized JavaScript origins
- [ ] Google Cloud Console has your Vercel callback URL in Authorized redirect URIs
- [ ] Supabase has your Vercel callback URL in Redirect URLs
- [ ] Vercel environment variables are set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] You've tested the OAuth flow on the Vercel deployment
- [ ] For production: Custom domain is configured in all three places

