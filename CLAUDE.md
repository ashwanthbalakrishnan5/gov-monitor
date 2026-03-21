# Legisly

Personalized legal/government change monitoring app. Built for HackASU 2026 (Governance track).

**Domain:** `legisly.ashwanthbk.com` | **API:** `legisly-api.ashwanthbalakrishnan5.workers.dev`

## Self-Update Rule

After every prompt, update this file to reflect any changes. This is the single source of truth.

## Stack

- React 19 + Vite + TypeScript + Yarn + Tailwind CSS 4
- Framer Motion for animations, shadcn/ui for base components
- Cloudflare Worker (API proxy) calling `claude-haiku-4-5-20251001`
- Cloudflare Pages (frontend auto-deploy from GitHub)
- No database, no auth. Profiles in localStorage, alert cache in sessionStorage

## Architecture

```text
Browser (React SPA)
  ├── localStorage: user profile
  ├── sessionStorage: cached alerts (keyed by profile hash)
  ├── Bundled data: 15 legal changes in src/data/legal-changes/
  └── POST /api/analyze ──> Cloudflare Worker ──> Claude API
                             (stateless, CORS-locked)
```

## Structure

```text
src/
  App.tsx                          # Routes: / /onboarding /dashboard /profile
  components/
    Logo.tsx                       # SVG icon + wordmark, sizes: sm/md/lg
    ui/                            # shadcn/ui primitives
    landing/                       # Hero, HowItWorks, ImpactQuote, TrustGrid, FinalCTA
    onboarding/                    # OnboardingWizard, 6 step components, SelectionChip/Card
    dashboard/                     # AlertCard, AlertFeed, FilterBar, NavBar, SkeletonCards
  hooks/use-mouse-spotlight.ts     # Reusable mouse-follow spotlight effect
  types/                           # profile.ts, legal-change.ts, alert.ts
  data/legal-changes/index.ts     # 15 typed legal change objects
  lib/
    api.ts                         # analyzeChanges() with sessionStorage caching
    profile.ts                     # get/save/deleteProfile (localStorage)
    completeness.ts                # Profile completeness score (0-100)
    prefilter.ts                   # extractTraits + preFilterChanges before API call
    utils.ts                       # cn() classname merge
public/favicon.svg                 # Navy square + copper L mark
worker/
  src/index.ts                     # POST /api/analyze, CORS, Claude prompt
  wrangler.toml                    # ALLOWED_ORIGIN, worker name
```

## Patterns

- **Onboarding branching:** Steps are conditional. Immigration shows if visa_holder, Employment if employed/self_employed/business_owner, Education if student. Core + Housing + Additional always show.
- **Alert pipeline:** preFilterChanges (trait matching) -> analyzeChanges (Claude API) -> merge with original LegalChange data -> sort by relevance -> filter score >= 10 -> cache.
- **Fonts:** Loaded via `<link>` in index.html, NOT CSS `@import` (conflicts with Tailwind CSS 4 `@import "tailwindcss"`).
- **Design tokens:** All in `src/index.css` as CSS custom properties. Dark mode supported via `[data-theme="dark"]`.
- **Glass cards:** `bg-white/80 backdrop-blur-20px border-black/[0.06]` pattern used across onboarding, landing, dashboard.
- **Grain texture:** SVG feTurbulence at ~2.5% opacity, CSS-only, zero JS cost. Used on landing page and onboarding.
- **Mouse spotlight:** `useMouseSpotlight` hook, applied to cards via spread `{...handlers}` + radial gradient overlay.

## Design Rules

- No em dashes in text content (reads AI-generated)
- No emojis in UI
- 44px minimum touch targets on all interactive elements
- Every alert card: severity tag, category tag, personal impact, matching transparency, source citation, disclaimer
- Profile data never leaves localStorage except for Claude API analysis
- Fonts: Instrument Serif (display), Inter (body), JetBrains Mono (data/labels)
- Colors: navy #1A2B4A, copper #C4703E, background #FAFAF9
- All animations respect `prefers-reduced-motion`

## Commands

```bash
yarn dev                                                  # Dev server
yarn build                                                # Production build
cd worker && npx wrangler deploy                          # Deploy API
cd worker && npx wrangler secret put ANTHROPIC_API_KEY    # Set API key
```
