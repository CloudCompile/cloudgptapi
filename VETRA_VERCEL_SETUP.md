# Vetra: Step-by-step setup on Vercel (from scratch)

This guide assumes you are deploying Vetra fresh or redeploying after a project reset.

## 1) Create the required accounts/projects

1. **GitHub**: ensure your Vetra code is in a GitHub repo.
2. **Vercel**: create a new project from the repo.
3. **Kinde**: create a new Kinde application (used for authentication).
4. **Supabase** (optional but recommended): create a new Supabase project for usage tracking and API keys.

---

## 2) Configure Kinde (authentication)

1. In Kinde, open your application dashboard.
2. Copy:
   - `KINDE_CLIENT_ID`
   - `KINDE_CLIENT_SECRET`
   - `KINDE_ISSUER_URL` (your `https://your_subdomain.kinde.com`)
3. In Kinde URL/redirect settings, allow your domains:
   - `http://localhost:3000`
   - `https://vetraai.vercel.app`
4. Set `KINDE_POST_LOGIN_REDIRECT_URL` to `https://vetraai.vercel.app/dashboard`.

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
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
4. Add any row-level/security settings you require for production.

If you are not using Supabase features yet, you can skip this and add later.

---

## 5) Set Vercel environment variables

In Vercel → Project → **Settings → Environment Variables**, add at minimum:

- `KINDE_CLIENT_ID`
- `KINDE_CLIENT_SECRET`
- `KINDE_ISSUER_URL`
- `KINDE_SITE_URL` = `https://vetraai.vercel.app`
- `KINDE_POST_LOGOUT_REDIRECT_URL` = `https://vetraai.vercel.app`
- `KINDE_POST_LOGIN_REDIRECT_URL` = `https://vetraai.vercel.app/dashboard`
- `POLLINATIONS_API_KEY`
- `NEXT_PUBLIC_APP_URL` = `https://vetraai.vercel.app`

Optional AI provider keys:

- `POLLINATIONS_API_KEY_2`
- `OPENROUTER_API_KEY`
- `AQUA_API_KEY`
- `SHALOM_API_KEY` (Bluesmind)
- `KIVEST_API_KEY`

Optional infrastructure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
3. Open `https://vetraai.vercel.app/v1/models` and confirm models are returned.
4. Test sign-in flow via Kinde.
5. If Supabase is enabled, test API key creation/usage tracking in dashboard.

---

## 8) Quick API smoke test

```bash
curl -X POST "https://vetraai.vercel.app/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "Hello from Vetra"}]
  }'
```

If this succeeds, your Vetra deployment is up.
