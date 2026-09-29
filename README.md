# Finora — AI Personal Finance Advisor

Finora helps people understand and plan their money. Users log income and
expenses, set savings goals, and get budget plans, saving suggestions and
monthly reports from **Finora AI**, powered by Google Gemini through
server-side calls so API keys never reach the browser.

## What's live now
- **Landing page** (`/`) — product story, how it works, privacy notice.
- **Dashboard** (`/app`) — income, expenses, savings rate and goal progress with
  month-over-month change; income vs. expenses, spending breakdown, savings trend
  and budget utilisation charts; recent transactions; a calculated spending insight.
- **My Finances** (`/app/finances`) — add, edit and delete income and expenses;
  search, filter by type/category/date, sort, paginate and export CSV.

The app currently runs in a clearly labelled **demo mode** on sample data from
`src/lib/fixtures.ts`. Edits work instantly across every screen and reset on reload.

## Tech
TanStack Start (React 19, TypeScript, file-based routing) · Vite · Tailwind CSS 4 ·
Recharts · Zod · Lucide icons · deployed on Netlify.

## Run locally
```bash
pnpm install
pnpm dev          # http://localhost:3000
# or, with Netlify emulation:
netlify dev
```

## Environment
AI features (upcoming) need `GEMINI_API_KEY`, set in **Netlify → Site
configuration → Environment variables** (or a local `.env`, which is gitignored).
It is only ever read on the server.

## Roadmap
See [PLAN.md](./PLAN.md). Next up: accounts and persistent storage, the
Gemini-backed endpoints, then the Budget Planner, Finora AI chat, Saving Goals,
Monthly Reports, Transaction History, Settings and onboarding.
