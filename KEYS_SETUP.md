# 🔑 Vetra Keys Setup Guide

This guide explains the environment variables needed to run Vetra.

## Required Environment Variables

Create `.env.local` for local development or set these in Vercel:

```env
# Kinde (required)
KINDE_CLIENT_ID=your_client_id
KINDE_CLIENT_SECRET=your_client_secret
KINDE_AUTH_DOMAIN=https://your_subdomain.kinde.com
KINDE_REDIRECT_URI=http://localhost:3000/api/auth/callback
KINDE_LOGOUT_REDIRECT_URI=http://localhost:3000

# Pollinations (recommended)
POLLINATIONS_API_KEY=your_pollinations_api_key
POLLINATIONS_API_KEY_2=your_second_pollinations_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Service Setup

### 1) Kinde
1. Create an account at https://app.kinde.com/register (free)
2. Create a Web Application in Kinde
3. Configure OAuth settings:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback` (local) or your production URL
   - Allowed Logout Redirect URLs: `http://localhost:3000` (local) or your production URL
4. Copy your credentials from **Settings > Applications > [Your App] > View Details**:
   - Client ID
   - Client Secret
   - Auth Domain (your_subdomain.kinde.com)
5. Add them to `.env.local` and Vercel environment variables.

### 2) Pollinations
1. Create/get API keys at https://enter.pollinations.ai
2. Set `POLLINATIONS_API_KEY`.
3. Optionally set `POLLINATIONS_API_KEY_2` for load distribution/fallback.

## Vercel Setup
1. Import the repository in Vercel.
2. Add environment variables above in **Project Settings → Environment Variables**.
   - Update `KINDE_REDIRECT_URI` and `KINDE_LOGOUT_REDIRECT_URI` to your Vercel domain
3. Deploy.

## Notes
- Never commit real keys.
- Rotate keys periodically.
- If rate-limited, add a second Pollinations key.
- Make sure KINDE_REDIRECT_URI matches the callback URL configured in Kinde

