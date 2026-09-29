import { Link, Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  History,
  LayoutDashboard,
  Menu,
  PiggyBank,
  RotateCcw,
  Search,
  Settings,
  Target,
  Wallet,
  X,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ToastProvider, useToast } from '@/components/Toast'
import { FinanceProvider, useFinance } from '@/lib/store'
import {
  CURRENCIES,
  expensesByCategory,
  formatCurrency,
  inMonth,
  monthKey,
  monthLabel,
  shiftMonth,
} from '@/lib/finance'
import type { CurrencyCode } from '@/lib/finance'

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

type NavItem = { label: string; icon: typeof Wallet; to?: '/app' | '/app/finances' }

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/app' },
  { label: 'My Finances', icon: Wallet, to: '/app/finances' },
  { label: 'Budget Planner', icon: PiggyBank },
  { label: 'AI Financial Advisor', icon: Bot },
  { label: 'Saving Goals', icon: Target },
  { label: 'Monthly Reports', icon: FileBarChart },
  { label: 'Transaction History', icon: History },
  { label: 'Settings', icon: Settings },
]

function AppLayout() {
  return (
    <FinanceProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </FinanceProvider>
  )
}

function Shell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  const title = NAV.find((n) => n.to === location.pathname.replace(/\/$/, ''))?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-canvas lg:pl-68">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-navy/50" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-rise">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <Header title={title} onMenu={() => setOpen(true)} />
      <DemoBanner />
      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { profile } = useFinance()
  const initials = profile.name.split(' ').map((p) => p[0]).join('')
  return (
    <div className="flex h-full flex-col bg-navy text-slate-300">
      <div className="flex items-center justify-between px-6 py-6">
        <Link to="/" aria-label="Finora home">
          <Logo tone="light" />
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
        {NAV.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/5 hover:text-white"
              activeProps={{ className: 'bg-white/10 text-white' }}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              title="Arriving in an upcoming release"
              className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500"
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Soon
              </span>
            </span>
          ),
        )}
      </nav>
      <div className="m-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand text-sm font-semibold text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{profile.name}</p>
          <p className="truncate text-xs text-slate-400">{profile.email}</p>
        </div>
      </div>
    </div>
  )
}

function Header({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { month, setMonth, currency, setCurrency, profile } = useFinance()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const current = monthKey(new Date())

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <button onClick={onMenu} className="rounded-lg p-2 hover:bg-white lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="mr-auto truncate text-lg font-semibold">{title}</h1>

        <form
          className="relative hidden md:block"
          onSubmit={(e) => {
            e.preventDefault()
            navigate({ to: '/app/finances', search: { q: q.trim() || undefined } })
          }}
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="global-search" className="sr-only">Search transactions</label>
          <input
            id="global-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search transactions…"
            className="h-10 w-56 rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand xl:w-72"
          />
        </form>

        <div className="flex items-center rounded-xl border border-line bg-white" role="group" aria-label="Selected month">
          <button className="p-2 text-muted hover:text-ink" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="num min-w-[7.5rem] text-center text-sm font-medium" aria-live="polite">{monthLabel(month)}</span>
          <button
            className="p-2 text-muted hover:text-ink disabled:opacity-30"
            aria-label="Next month"
            disabled={month >= current}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <label className="sr-only" htmlFor="currency">Currency</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="hidden h-10 rounded-xl border border-line bg-white px-2 text-sm font-medium sm:block"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>

        <Notifications />

        <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand text-xs font-semibold text-white sm:flex" title={profile.name}>
          {profile.name.split(' ').map((p) => p[0]).join('')}
        </span>
      </div>
    </header>
  )
}

/** Alerts derived from real budget-vs-actual for the selected month. */
function Notifications() {
  const { transactions, budget, month, currency } = useFinance()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const alerts = useMemo(() => {
    const spent = new Map(expensesByCategory(inMonth(transactions, month)).map((c) => [c.category, c.amount]))
    return budget
      .map((b) => ({ ...b, spent: spent.get(b.category) ?? 0 }))
      .filter((b) => b.limit > 0 && b.spent / b.limit >= 0.9)
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
  }, [transactions, budget, month])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-muted hover:text-ink"
        aria-label={`Notifications (${alerts.length})`}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div className="card absolute right-0 top-12 z-30 w-80 p-2 animate-rise">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Budget alerts · {monthLabel(month, 'short')}
          </p>
          {alerts.length === 0 ? (
            <p className="px-3 pb-3 text-sm text-muted">Every category is comfortably within budget.</p>
          ) : (
            <ul>
              {alerts.map((a) => {
                const over = a.spent > a.limit
                return (
                  <li key={a.category} className="rounded-xl px-3 py-2.5 hover:bg-canvas">
                    <p className="text-sm font-medium">
                      {a.category}{' '}
                      <span className={over ? 'text-danger' : 'text-amber-600'}>
                        {over ? 'over budget' : 'near limit'}
                      </span>
                    </p>
                    <p className="num text-xs text-muted">
                      {formatCurrency(a.spent, currency)} of {formatCurrency(a.limit, currency)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function DemoBanner() {
  const { resetDemo } = useFinance()
  const toast = useToast()
  return (
    <div className="border-b border-amber-200 bg-warning-soft">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm text-amber-900 sm:px-6 lg:px-10">
        <span className="rounded-md bg-amber-200/70 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">Demo mode</span>
        <span className="flex-1">You're exploring sample data. Edits work, but reset when you reload the page.</span>
        <button
          onClick={() => {
            if (window.confirm('Reset all sample data? Any edits you made will be discarded.')) {
              resetDemo()
              toast('Sample data restored', 'info')
            }
          }}
          className="inline-flex items-center gap-1.5 font-semibold hover:underline">
          <RotateCcw className="h-3.5 w-3.5" /> Reset sample data
        </button>
      </div>
    </div>
  )
}
