# AGENTS.md

Finora is an AI personal finance advisor built with TanStack Start and deployed
on Netlify. **Continue from [PLAN.md](./PLAN.md)** — milestone 1 (product
surface) is done; pick up the next unchecked milestone.

## Stack
TanStack Start + TanStack Router (file routes), React 19, TypeScript strict,
Vite 7, Tailwind CSS 4 (`@theme` tokens in `src/styles.css`), Recharts, Zod 4,
lucide-react. Package manager: pnpm.

## Layout
```
src/
  routes/
    __root.tsx        # HTML shell, meta, Google Fonts (Fraunces + Plus Jakarta Sans)
    index.tsx         # Marketing landing page
    app.tsx           # /app layout: FinanceProvider, ToastProvider, sidebar, header, demo banner
    app.index.tsx     # Dashboard
    app.finances.tsx  # My Finances (CRUD, filters, CSV). Accepts ?q= search param
  components/
    Logo.tsx, ui.tsx (Panel, Delta, ProgressBar, Skeleton, ClientOnly), Toast.tsx
    TransactionDialog.tsx  # add/edit modal + `transactionSchema` (Zod)
  lib/
    finance.ts   # types, categories, colours, Intl currency formatting, all calculations
    fixtures.ts  # ALL demo data (transactions generated relative to today, goals, budget)
    store.tsx    # useFinance() context — in-memory, seeded from fixtures
```

## Conventions & decisions
- All money maths lives in `lib/finance.ts`; UI never recomputes ad hoc. Division
  helpers return `null` when there's no baseline (no income / no prior month) and
  the UI renders an explanatory label instead of 0%.
- Currency is formatted only via `formatCurrency` (Intl.NumberFormat); never
  hardcode symbols. Default INR.
- `store.tsx` is the seam for persistence: keep its API, swap internals for
  API calls in milestone 2 (Netlify Database + Drizzle, Netlify Identity).
- Charts render inside `ClientOnly` (Recharts needs the DOM) with a skeleton fallback;
  every chart figure has an `aria-label` summary.
- Sidebar items without a route yet are rendered disabled with a "Soon" tag
  (`NAV` in `app.tsx`) — add a `to` when the page ships.
- The dashboard insight card is explicitly labelled "Calculated · not AI". Never
  present sample or computed content as live Gemini output.
- Gemini must only be called server-side with `GEMINI_API_KEY`; never expose it.
- Design tokens: navy sidebar `#0F172A`, canvas `#F8FAFC`, brand `#2563EB`,
  positive `#16A34A`, warning `#F59E0B`, danger `#EF4444`, AI violet `#6D4AFF`.
