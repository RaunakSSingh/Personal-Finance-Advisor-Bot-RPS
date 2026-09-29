# Finora — product roadmap

Finora is an AI personal finance advisor: users log income, expenses and goals,
and Finora AI (Google Gemini, called only from the server) turns those figures
into budget plans, saving suggestions and monthly summary reports.

Each milestone is small and self-contained. Tick them off in order.

## ✅ Milestone 1 — Product surface (done)
- Landing page (`/`) with the Finora brand, how-it-works flow and privacy notice.
- App shell (`/app`): navy sidebar with all eight sections, mobile drawer,
  header with transaction search, month selector, currency switcher and
  budget-alert notifications, demo-mode banner with reset.
- Dashboard (`/app`): income / expenses / savings / goal-progress cards with
  month-over-month deltas, income-vs-expenses, spending donut, savings trend and
  budget-utilisation charts, recent transactions, calculated insight card.
- My Finances (`/app/finances`): add / edit / delete income and expenses with
  Zod validation, search, type/category/date filters, sorting, pagination, CSV
  export, live totals.
- All data comes from `src/lib/fixtures.ts` through `src/lib/store.tsx` (in memory).

## Milestone 2 — Persistence & accounts
- Netlify Identity for sign-up / login / logout (sidebar profile menu).
- Netlify Database (Postgres + Drizzle) schema in `db/schema.ts`: profiles,
  transactions, budgets, savings_goals, monthly_reports, ai_conversations —
  every row scoped by `user_id`.
- API routes for CRUD; swap `store.tsx` internals to call them while keeping
  its public API. Keep a signed-out demo mode seeded from fixtures.

## Milestone 3 — Gemini integration foundation
- Server routes: `generate-budget`, `generate-savings-plan`, `financial-chat`,
  `generate-monthly-report`, `analyze-spending` (POST, Zod-validated in and out).
- `GEMINI_API_KEY` read server-side only; structured JSON output; graceful
  handling of missing/invalid key, rate limits, malformed and empty responses.
- AI status endpoint for Settings; clearly labelled sample responses when AI is
  not configured. Replace the dashboard's calculated insight with `analyze-spending`.

## Milestone 4 — Budget Planner
- Setup form (income, fixed/variable costs, savings, goals, style, currency, month).
- "Generate My Budget with AI" → summary, category table (recommended / actual /
  remaining), chart, recommendations. Edit limits, save, reset, regenerate.
- Explicit warning whenever allocations exceed income.

## Milestone 5 — Finora AI advisor chat
- Chat UI with timestamps, suggested prompts, loading/error/retry, copy,
  clear conversation, follow-up suggestions; persisted conversation history.
- Minimal financial context sent per request; markdown rendered safely.

## Milestone 6 — Saving Goals
- Goal CRUD, add/withdraw money (with confirmation), mark complete, progress
  history, required monthly amount; "Get AI Savings Plan" with surplus checks.

## Milestone 7 — Monthly Reports
- Income, expense, savings and budget-performance sections for any month.
- "Generate Monthly AI Report" (8 sections, refuses to invent missing data).
- Print, PDF export and CSV download with month and currency in the output.

## Milestone 8 — Transaction History & Settings
- Dedicated history table with category icons and bulk CSV export.
- Settings: profile, currency/region, financial preferences, light/dark/system
  theme, data export, clear/reset/delete account (confirmed), AI status panel.

## Milestone 9 — Onboarding & polish
- Five-step onboarding (welcome → profile → expenses → goals → dashboard) with
  progress persisted across refreshes.
- Unit tests for `src/lib/finance.ts` calculations and validation schemas;
  accessibility and responsive QA pass.
