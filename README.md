# Legisly

**Personalized legal and government change monitoring for the people who need it most.**

> Built for HackASU 2026 -- Governance Track

**Live Demo:** [legisly.ashwanthbk.com](https://legisly.ashwanthbk.com)

---

## The Problem

Government policy changes -- executive orders, visa rules, housing regulations, education funding shifts -- affect millions of people differently depending on their circumstances. A student on an F-1 visa, a small business owner, and a renter in Arizona all face distinct impacts from the same legislation. Yet most people only hear about changes through fragmented news cycles, often too late to act.

There is no personalized, accessible way for everyday citizens to understand _how specific legal changes affect them personally_ and _what they can do about it_.

## What Legisly Does

Legisly analyzes real government policy changes against your personal profile (visa status, employment, housing, education, location) and delivers **personalized impact alerts** ranked by relevance to your life. It goes beyond informing -- it helps you **take action** through AI-powered tools and civic engagement features.

### Core Features

- **Personalized Alert Feed** -- Real legal changes (executive orders, USCIS policies, state legislation) analyzed against your profile using AI. Each alert includes severity rating, personal impact explanation, source citations, and match transparency showing _why_ it was flagged for you.

- **AI Chat Assistant** -- Live Claude-powered conversational AI that understands your profile and alerts. Ask questions about any policy change, get plain-language explanations, draft public comment letters, find upcoming hearings, or generate advocacy templates -- all personalized to your situation.

- **Action Center** -- Every alert card has one-tap actions: "Ask AI" for deep dives, "Draft Letter" for representative correspondence, "Find Hearings" for relevant public meetings, and "Public Comment" for formal response templates. Each action opens the AI chat with pre-seeded context.

- **Impact Timeline** -- Chronological view of all changes with real severity ratings and days-until-effective badges. Personalized impact descriptions adapt based on your profile (a student sees different impact text than a business owner for the same policy).

- **Representatives Dashboard** -- Your federal and state representatives with alignment scores, voting records on issues that affect you, committee assignments, and direct contact buttons (call, email, website).

- **Community Pulse** -- Sentiment visualization showing how different demographic groups feel about each policy change. Animated concern/neutral/supportive breakdowns with demographic detail.

- **Civic Engagement Tracker** -- Real-time scoring based on your actual app usage. 8 unlockable badges tied to real actions (first alert reviewed, profile completed, 5+ alerts saved, 3-day streak, etc.). Activity log, streak counter, and shareable score card.

- **Notification Preferences** -- Configure alert channels, topic subscriptions across 9 categories with "For You" badges based on your profile, severity thresholds, delivery frequency, and keyword watchlists.

- **Privacy Dashboard** -- Full data inventory showing exactly what is stored and what is not. AI transparency cards explaining how analysis works. One-click JSON data export and complete data deletion.

### Smart Onboarding

A branching wizard that adapts to who you are. Immigration steps only appear if you are a visa holder. Employment details only show for workers and business owners. Education questions only surface for students. This keeps setup fast while capturing the details needed for accurate personalization.

## How It Works

```
Profile Setup (branching onboarding wizard)
        |
        v
Legal Change Ingestion (executive orders, USCIS memos, state bills)
        |
        v
Trait Extraction (visa type, employment, housing, education, location)
        |
        v
Pre-filtering (match changes to relevant profile traits)
        |
        v
AI-Powered Analysis (Claude API, parallel batched processing)
        |
        v
Personalized Alert Feed (sorted by relevance, severity-tagged)
        |
        v
Action Center + AI Chat (Claude-powered, profile-aware responses)
```

1. **You build a profile** through an adaptive onboarding wizard (2-6 steps depending on your situation).
2. **Legisly extracts traits** from your profile -- visa type, employment status, housing situation, education level, location.
3. **Legal changes** are pre-filtered against your traits and analyzed via the Claude API in parallel batches.
4. **Alerts appear progressively** as each batch completes, ranked by personal relevance.
5. **Each alert is actionable** -- expand for full impact analysis, take action through AI-powered tools, save for later, or dismiss with undo.

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 8                         |
| Styling    | Tailwind CSS 4, custom design system                 |
| Animation  | Framer Motion                                        |
| Components | shadcn/ui + Radix UI primitives                      |
| AI Backend | Cloudflare Worker + Claude Haiku API                 |
| Hosting    | Cloudflare Pages (auto-deploy from GitHub)           |
| PWA        | vite-plugin-pwa (offline support, auto-update)       |
| Data       | localStorage (client-side, zero server-side storage) |

## Privacy-First Architecture

Legisly stores **zero user data on any server**. Your profile, alerts, preferences, and engagement data live entirely in your browser's localStorage. The only network call is to the AI chat endpoint, which processes queries in real-time without persisting conversation history. You can export all your data as JSON or delete everything with one button.

## Running Locally

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev

# Start API worker locally (for AI chat)
cd worker && npx wrangler dev
```

The app works fully offline as a PWA. AI features require the Cloudflare Worker to be running.

## Project Structure

```
src/
  pages/              # 10 feature pages (Landing, Onboarding, Dashboard, Profile,
                      #   Representatives, Timeline, Pulse, Engagement, Alerts, Privacy)
  components/
    landing/          # Hero, HowItWorks, ImpactQuote, TrustGrid, FinalCTA
    onboarding/       # Adaptive wizard with 6 conditional steps
    dashboard/        # AppLayout, Sidebar, AlertCard, AlertFeed, FilterBar
    chat/             # AI chat panel powered by Claude API
  data/
    legal-changes/    # Real legal change objects with source citations
    timeline-data.ts  # Severity mapping + profile-aware impact text
  lib/                # API client, profile management, engagement tracking, prefiltering
  types/              # TypeScript interfaces for profiles, alerts, legal changes
worker/
  src/index.ts        # Cloudflare Worker: /api/chat + /api/analyze endpoints
```

## Design Philosophy

- **Dark mode only** -- Designed for focus and readability
- **Glass morphism design system** -- Layered glass panels with grain texture and atmospheric lighting
- **44px minimum touch targets** -- Accessibility-first interaction design
- **Progressive disclosure** -- Accordion alerts show summary first, full analysis on expand
- **Purposeful animation** -- Every motion serves a function; `prefers-reduced-motion` respected throughout
- **Mobile-first responsive** -- Bottom tab bar on mobile, sidebar on desktop, safe-area aware for notched devices

## Team

Built by **Ashwanth Balakrishnan** & **Keerthana Jayaraman** at HackASU 2026.

---

_Legisly does not provide legal advice. All analysis is AI-generated for informational purposes. Always consult qualified professionals for legal decisions._
