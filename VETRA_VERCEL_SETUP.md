# Vetra: Step-by-step setup on Vercel (from scratch)

This guide assumes you deleted the previous Vercel project, Supabase project, and Clerk app.

## 1) Create the required accounts/projects

1. **GitHub**: ensure your Vetra code is in a GitHub repo.
2. **Vercel**: create a new project from the repo.
3. **Clerk**: create a new Clerk application.
4. **Supabase** (optional but recommended): create a new Supabase project.

---

## 2) Configure Clerk (authentication)

1. In Clerk, open your app dashboard.
2. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. In Clerk URL/redirect settings, allow your domains:
   - `http://localhost:3000`
   - `https://vetraai.vercel.app`

---

## 3) Configure Pollinations (provider)

1. Get your key(s) from https://enter.pollinations.ai
2. Prepare:
   - `POLLINATIONS_API_KEY`
   - (optional) `POLLINATIONS_API_KEY_2`

---

## 4) Configure Supabase (optional but recommended)

If you want hosted data for usage/keys:

1. In Supabase, create a new project.
2. Open SQL Editor and run `SUPABASE_SETUP.sql` from the repository root.
3. From Project Settings → API, copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
4. Add any row-level/security settings you require for production.

If you are not using Supabase features yet, you can skip this and add later.

---

## 5) Set Vercel environment variables

In Vercel → Project → **Settings → Environment Variables**, add at minimum:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `POLLINATIONS_API_KEY`
- `NEXT_PUBLIC_APP_URL` = `https://vetraai.vercel.app`

Optional:

- `POLLINATIONS_API_KEY_2`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Apply to **Production**, **Preview**, and **Development** as needed.

---

## 6) Deploy

1. Push your latest `Vetra` changes to GitHub.
2. In Vercel, trigger a new deployment.
3. Wait for build to complete.

---

## 7) Verify deployment

Run these checks:

1. Open `https://vetraai.vercel.app/` and confirm Vetra branding.
2. Open `https://vetraai.vercel.app/v1` and verify status JSON is returned.
3. Open `https://vetraai.vercel.app/v1/models` and confirm returned models are Pollinations-only.
4. If Clerk is enabled, test sign-in flow.
5. If Supabase is enabled, test API key creation/usage tracking in dashboard.

---

## 8) Quick API smoke test

```bash
curl -X POST "https://vetraai.vercel.app/v1/chat/completions" \
  -H "Authorization: Bearer cgpt_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "Hello from Vetra"}]
  }'
```

If this succeeds, your Vetra deployment is up.
