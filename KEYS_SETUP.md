# 🔑 Vetra Keys Setup Guide

This guide explains the environment variables needed to run Vetra.

## Required Environment Variables

Create `.env.local` for local development or set these in Vercel:

```env
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY

# Pollinations (recommended)
POLLINATIONS_API_KEY=your_pollinations_api_key
POLLINATIONS_API_KEY_2=your_second_pollinations_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Service Setup

### 1) Clerk
1. Create an app in Clerk.
2. Copy your publishable key and secret key.
3. Add them to `.env.local` and Vercel environment variables.

### 2) Pollinations
1. Create/get API keys at https://enter.pollinations.ai
2. Set `POLLINATIONS_API_KEY`.
3. Optionally set `POLLINATIONS_API_KEY_2` for load distribution/fallback.

## Vercel Setup
1. Import the repository in Vercel.
2. Add environment variables above in **Project Settings → Environment Variables**.
3. Deploy.

## Notes
- Never commit real keys.
- Rotate keys periodically.
- If rate-limited, add a second Pollinations key.
