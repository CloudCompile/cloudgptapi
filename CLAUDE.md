# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## What This Is

**Vetra** — a Next.js 15 App Router application that acts as an OpenAI-compatible API gateway. It exposes `/v1/chat/completions`, `/v1/models`, `/v1/images/generations`, and `/v1/video/generations` backed by multiple upstream AI providers (Pollinations, OpenRouter, Bluesminds, Groq, Cerebras, Google AI Studio, Liz proxy, etc.). Users authenticate via Kinde, manage API keys from the dashboard, and are billed through Stripe. All state (users, API keys, usage logs, errors) lives in Supabase.

---

## Request Lifecycle — Chat Completions

```
POST /v1/chat/completions  (nodejs runtime, maxDuration=300s)
  └── withErrorHandler()                     lib/api-wrapper.ts
        └── processAuth()                    services/auth.ts
              — validates Bearer token (vtai_...) via Supabase api_keys table
              — falls back to Kinde session for dashboard users
              — resolves plan → rate limit + daily limit
        └── processContextAndMemory()        services/parser.ts
              — extracts userId / characterId (supports SillyTavern + Chub JAI headers)
              — retrieves long-term memory from Meridian (MERIDIAN_API_KEY)
              — runs Fandom/Lorebook plugin if enabled on the API key (FANDOM_PLUGIN_URL)
              — injects web search results if search plugin enabled
              — Gemini-specific: converts system messages → user context messages
        └── sanitizeMessagesForProvider()    services/parser.ts
              — strips trailing assistant messages for Gemini
              — converts trailing empty assistant messages for other providers
        └── dispatchChatRequest()            services/dispatcher.ts
              — resolves model alias via PROVIDER_MODEL_MAPPING (lib/chat-utils.ts)
              — selects upstream URL from PROVIDER_URLS (lib/chat-utils.ts)
              — load-balances across multiple provider API keys using crypto RNG
              — handles streaming: heartbeat every 15s, 60s first-token timeout, 5min stall limit
              — post-response: fires rememberInteraction() for memory-enabled models
        └── trackUsage()                     lib/api-keys.ts
              — writes to Supabase usage_logs table
              — response includes X-RateLimit-* and X-DailyLimit-* headers
```

---

## Directory Map

```
app/
  v1/                         Public OpenAI-compatible API
    route.ts                  GET /v1 — health/discovery
    models/route.ts           GET /v1/models
    chat/completions/
      route.ts                POST /v1/chat/completions (main entry)
      services/
        auth.ts               Auth resolution → AuthResult
        parser.ts             Memory/plugin/sanitize pipeline → ParseResult
        dispatcher.ts         Provider selection + upstream fetch
        providers/
          ProviderStrategy.ts Interface; dispatcher selects impl per provider
  api/                        Internal API (all nodejs runtime)
    keys/                     CRUD for user API keys
    usage/                    Usage stats for dashboard
    image/                    POST image generation (Pollinations)
    video/                    POST video generation (Pollinations)
    mem/                      Memory API (Meridian)
    stripe/                   Stripe webhook handler
    admin/                    Admin-only endpoints
    auth/                     Kinde auth callbacks
    promo/                    Promo code redemption
    invite/                   Invite system
    profile/                  User profile reads (used by Header to detect auth state)
    settings/                 User settings
    status/                   Health check

  dashboard/page.tsx          API key management + usage stats (client component)
  dashboard/plugins/          Plugin settings UI
  playground/page.tsx         Interactive model tester
  settings/page.tsx           User settings
  admin/                      Admin panel (uses Admin/ components)
  models/, pricing/, about/   Marketing pages

Admin/                        Admin panel JSX components (not TSX)
components/
  MainLayout.tsx              Root shell: Header, Sidebar, BottomNav, LaunchBanner
  Sidebar.tsx                 App nav (dashboard/playground/models/docs)
  BottomNav.tsx               Mobile bottom nav
  sync-user.tsx               Server component — syncs Kinde user → Supabase profiles on load
  user-status.tsx             Displays plan badge in header
  terms-acknowledgment.tsx    Terms modal

lib/
  providers.ts                ALL model definitions + tier arrays
  chat-utils.ts               PROVIDER_URLS, PROVIDER_MODEL_MAPPING, createChatTransformStream
  api-keys.ts                 validateApiKey, checkRateLimit, checkDailyLimit, trackUsage
  api-keys-utils.ts           Pure helpers (no server-only deps — safe to import in client)
  kinde-auth.ts               Server-side Kinde session helpers
  supabase.ts                 Lazy supabase (anon) + supabaseAdmin (service role) clients
  utils.ts                    cn(), getCorsHeaders(), getPollinationsApiKeys(), all provider key getters
  schema.ts                   Zod: ChatCompletionRequestSchema
  admin-actions.ts            Server Actions for admin (verifyAdmin guard inside each)
  error-logger.ts             logErrorToSupabase() → error_logs table
  memory.ts                   retrieveMemory() + rememberInteraction() via Meridian API
  plugins.ts                  runFandomPlugin() — remote VPS lore injection
  web-search.ts               runWebSearch() — injects web context into messages
  stripe.ts                   Stripe client singleton
  types.ts                    Shared TypeScript interfaces (UsageLog, ApiKey, etc.)
```

---

## Key Conventions

### API Key Format
Keys are prefixed `vtai_` followed by a UUID with no hyphens (total 37 chars). `extractApiKey()` in `lib/api-keys-utils.ts` enforces the prefix; anything else is ignored. Old keys prefixed `cgpt_` exist in older client configs.

### Model Resolution
`PROVIDER_MODEL_MAPPING` in `lib/chat-utils.ts` maps public-facing aliases (`"openai"`, `"gemini-large"`, `"liz-claude-3-7-sonnet"`, etc.) to actual upstream model IDs. The dispatcher calls `resolveModelId()` then looks up the model object in `CHAT_MODELS` from `lib/providers.ts`. **Do not apply `PROVIDER_MODEL_MAPPING` before the dispatcher** — there is a comment in the code warning about this.

### Model Tiers
Defined as arrays in `lib/providers.ts`: `FREE_MODELS`, `PREMIUM_MODELS`, `ULTRA_MODELS`, `ADMIN_ONLY_MODELS`. Plans: `free → pro → ultra → admin/enterprise/developer`. Peak hours apply a penalty multiplier via `applyPeakHoursLimit()`.

### Plan Resolution Order
1. API key's own `plan` column (key-level override takes precedence)
2. `profiles.plan` from Supabase
3. Email-based override via `applyPlanOverride()` (hardcoded exceptions in `lib/api-keys.ts`)

### Multi-Key Load Balancing
Provider keys are stored in numbered env vars (`OPENROUTER_API_KEY`, `OR_KEY_1`…`OR_KEY_N`, etc.). `getOpenRouterApiKeys()` and similar functions in `lib/utils.ts` collect all populated variants. The dispatcher uses `secureShuffleArray()` (crypto RNG) to pick randomly.

### Gemini Quirks
Gemini rejects `system` role messages and trailing `assistant` messages. `parser.ts` converts system messages to user messages for Gemini, and `sanitizeMessagesForProvider()` removes trailing assistant turns. Lore/memory is injected into the first user message instead of a system message.

### Streaming
`createChatTransformStream()` in `lib/chat-utils.ts` normalises SSE from all providers into OpenAI-compatible `data: {...}` chunks. The dispatcher wraps the stream with a heartbeat (`: ping` every 15s), a 60s first-token timeout, and a 5-minute stall detector.

### User Sync
`components/sync-user.tsx` is a Server Component rendered in the root layout. On every authenticated page load it calls `syncUser()` (a Server Action in `lib/admin-actions.ts`) to upsert the Kinde user into the Supabase `profiles` table. Auth state in the Header is detected client-side by calling `GET /api/profile` (cheap endpoint, no redirect).

### Admin Access
Admin routes (`/admin/:path*`) are protected by the Kinde middleware. Server Actions in `lib/admin-actions.ts` additionally call `verifyAdmin()` which checks `profiles.role === 'admin'` in Supabase. The Admin panel lives in `Admin/` as plain JSX.

---

## Supabase Tables (referenced in code)

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts — `id`, `email`, `plan`, `role`, `username` |
| `api_keys` | API keys — `key`, `user_id`, `plan`, `rate_limit`, `fandom_plugin_enabled` |
| `usage_logs` | Per-request logs — `type`, `model_id`, `tokens`, `user_id`, `api_key_id` |
| `error_logs` | Error tracking — `level`, `message`, `path`, `user_id` |

---

## Environment Variables

See `.env.example` for the full list. Minimum required:

```
# Kinde auth
KINDE_CLIENT_ID, KINDE_CLIENT_SECRET, KINDE_AUTH_DOMAIN
KINDE_REDIRECT_URI, KINDE_LOGOUT_REDIRECT_URI

# Supabase
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# App
NEXT_PUBLIC_APP_URL

# Stripe
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Provider keys (`POLLINATIONS_API_KEY`, `OR_KEY`, `GROQ_API_KEY`, etc.) are optional but needed for production. OpenRouter supports up to 10 numbered keys (`OPENROUTER_API_KEY1`…`OPENROUTER_API_KEY10`).

---

## Adding a New Provider

1. Add model entries with the new `provider` discriminant to `lib/providers.ts` (include `usageWeight`)
2. Add upstream base URL to `PROVIDER_URLS` in `lib/chat-utils.ts`
3. Add key getter function(s) in `lib/utils.ts`
4. Add dispatch logic in `services/dispatcher.ts` — check `model.provider === 'newprovider'`
5. If the provider streams in a non-standard format, extend `createChatTransformStream` in `lib/chat-utils.ts`
6. Add env var(s) to `.env.example`
