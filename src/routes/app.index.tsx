import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, Plus, RefreshCw, Sparkles, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { ClientOnly, Delta, Panel, ProgressBar, Skeleton } from '@/components/ui'
import { TransactionDialog } from '@/components/TransactionDialog'
import { useToast } from '@/components/Toast'
import { useFinance } from '@/lib/store'
import {
  CATEGORY_COLORS,
  expensesByCategory,
  formatCurrency,
  goalProgress,
  inMonth,
  monthLabel,
  percentChange,
  round2,
  shiftMonth,
  summarize,
} from '@/lib/finance'
import type { CurrencyCode, Transaction } from '@/lib/finance'

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function useGreeting() {
  const [g, setG] = useState('Hello')
  useEffect(() => {
    const h = new Date().getHours()
    setG(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])
  return g
}

function Dashboard() {
  const { profile, transactions, goals, budget, month, currency, addTransaction } = useFinance()
  const greeting = useGreeting()
  const toast = useToast()
  const [adding, setAdding] = useState(false)

  const monthTxs = useMemo(() => inMonth(transactions, month), [transactions, month])
  const cur = useMemo(() => summarize(monthTxs), [monthTxs])
  const prev = useMemo(() => summarize(inMonth(transactions, shiftMonth(month, -1))), [transactions, month])

  const trend = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const key = shiftMonth(month, i - 5)
        const s = summarize(inMonth(transactions, key))
        return { month: monthLabel(key, 'short'), Income: s.income, Expenses: s.expenses, Savings: s.netSavings }
      }),
    [transactions, month],
  )

  const byCategory = useMemo(() => expensesByCategory(monthTxs), [monthTxs])

  const utilization = useMemo(() => {
    const spent = new Map(byCategory.map((c) => [c.category, c.amount]))
    return budget
      .map((b) => ({ category: b.category, Budget: b.limit, Actual: spent.get(b.category) ?? 0 }))
      .sort((a, b) => b.Budget - a.Budget)
  }, [budget, byCategory])

  const goalTotals = useMemo(() => {
    const target = goals.reduce((s, g) => s + g.targetAmount, 0)
    const saved = goals.reduce((s, g) => s + g.currentAmount, 0)
    return { target, saved, pct: goalProgress(saved, target) }
  }, [goals])

  const fmt = (n: number) => formatCurrency(n, currency)
  const firstName = profile.name.split(' ')[0]

  if (transactions.length === 0) {
    return <Onboarding onAdd={() => setAdding(true)} dialog={<TransactionDialog open={adding} onClose={() => setAdding(false)} onSave={(t) => { addTransaction(t); setAdding(false); toast('Transaction added') }} />} />
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-rise">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting}, {firstName}!
          </h2>
          <p className="mt-1.5 text-muted">Here's your financial overview for {monthLabel(month)}.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAdding(true)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold transition hover:border-slate-300">
            <Plus className="h-4 w-4" /> Add transaction
          </button>
          <a href="#insight" className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy-700">
            <Sparkles className="h-4 w-4 text-sky-300" /> Generate Insights
          </a>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={TrendingUp} tone="positive" label="Total monthly income" value={fmt(cur.income)} delta={<Delta value={percentChange(cur.income, prev.income)} />} />
        <Metric icon={TrendingDown} tone="danger" label="Total monthly expenses" value={fmt(cur.expenses)} delta={<Delta value={percentChange(cur.expenses, prev.expenses)} goodWhenUp={false} />} />
        <Metric
          icon={Wallet}
          tone="brand"
          label="Total savings"
          value={fmt(cur.netSavings)}
          valueClass={cur.netSavings < 0 ? 'text-danger' : undefined}
          delta={
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">
                {cur.savingsRate === null ? 'No income logged' : `${cur.savingsRate.toFixed(1)}% savings rate`}
              </span>
              <Delta value={percentChange(cur.netSavings, prev.netSavings)} />
            </span>
          }
        />
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Savings goal progress</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai-soft text-ai"><Target className="h-[18px] w-[18px]" /></span>
          </div>
          <p className="num mt-2 text-2xl font-semibold">{goalTotals.pct.toFixed(1)}%</p>
          <div className="mt-3"><ProgressBar value={goalTotals.pct} label="Combined goal progress" /></div>
          <p className="num mt-2 text-xs text-muted">
            {fmt(goalTotals.saved)} of {fmt(goalTotals.target)} across {goals.length} goals
          </p>
        </div>
      </div>

      {monthTxs.length === 0 && (
        <div className="card flex flex-col items-start gap-3 border-dashed p-6 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted">
            Nothing logged for {monthLabel(month)} yet, so this month's figures are empty rather than zero-spend.
          </p>
          <button onClick={() => setAdding(true)} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Add the first one</button>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Income vs. expenses" subtitle="Last six months">
          <ChartBox label={`Bar chart of income and expenses for the six months ending ${monthLabel(month)}.`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={4} margin={{ left: 0, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} stroke="#EEF1F5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, currency, { compact: true })} />
                <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ fill: '#F1F5F9' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Expenses" fill="#CBD5E1" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Spending breakdown" subtitle={monthLabel(month)}>
          {byCategory.length === 0 ? (
            <EmptyChart text="No expenses this month." />
          ) : (
            <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
              <ChartBox height="h-[180px]" label={`Donut chart of ${monthLabel(month)} spending by category. Largest: ${byCategory[0].category}.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="amount" nameKey="category" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
                      {byCategory.map((c) => (
                        <Cell key={c.category} fill={CATEGORY_COLORS[c.category] ?? '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip content={<MoneyTooltip currency={currency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
              <ul className="space-y-2 text-sm">
                {byCategory.slice(0, 6).map((c) => (
                  <li key={c.category} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} aria-hidden="true" />
                    <span className="flex-1">{c.category}</span>
                    <span className="num text-muted">{((c.amount / cur.expenses) * 100).toFixed(0)}%</span>
                    <span className="num w-24 text-right font-medium">{fmt(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Savings trend" subtitle="Net savings per month">
          <ChartBox label="Line chart of net savings over the last six months.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#EEF1F5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => formatCurrency(v, currency, { compact: true })} />
                <Tooltip content={<MoneyTooltip currency={currency} />} />
                <Line type="monotone" dataKey="Savings" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3.5, fill: '#2563EB' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>

        <Panel title="Budget utilization" subtitle="Budgeted vs. actual, this month">
          <ChartBox height="h-[300px]" label="Horizontal bar chart comparing budget limits with actual spending per category.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilization} layout="vertical" barGap={2} margin={{ left: 8, right: 8 }}>
                <CartesianGrid horizontal={false} stroke="#EEF1F5" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency, { compact: true })} />
                <YAxis type="category" dataKey="category" width={96} tickLine={false} axisLine={false} tick={{ fill: '#334155', fontSize: 12 }} />
                <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ fill: '#F1F5F9' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budget" fill="#DBE4F3" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="Actual" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={8}>
                  {utilization.map((u) => (
                    <Cell key={u.category} fill={u.Actual > u.Budget ? '#EF4444' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </Panel>
      </div>

      {/* Transactions + insight */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent transactions"
          action={
            <Link to="/app/finances" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              View all transactions <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <RecentTable txs={transactions.slice(0, 5)} currency={currency} />
        </Panel>

        <InsightCard />
      </div>

      <TransactionDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(t) => {
          addTransaction(t)
          setAdding(false)
          toast('Transaction added')
        }}
      />
    </div>
  )
}

function Metric({
  icon: Icon,
  tone,
  label,
  value,
  delta,
  valueClass,
}: {
  icon: typeof Wallet
  tone: 'positive' | 'danger' | 'brand'
  label: string
  value: string
  delta: React.ReactNode
  valueClass?: string
}) {
  const chip = { positive: 'bg-positive-soft text-positive', danger: 'bg-danger-soft text-danger', brand: 'bg-brand-soft text-brand' }[tone]
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${chip}`}><Icon className="h-[18px] w-[18px]" /></span>
      </div>
      <p className={`num mt-2 text-2xl font-semibold tracking-tight ${valueClass ?? ''}`}>{value}</p>
      <div className="mt-2">{delta}</div>
    </div>
  )
}

function ChartBox({ children, label, height = 'h-[260px]' }: { children: React.ReactNode; label: string; height?: string }) {
  return (
    <figure className={`${height} w-full`} role="img" aria-label={label}>
      <ClientOnly fallback={<Skeleton className="h-full w-full" />}>{children}</ClientOnly>
    </figure>
  )
}

function EmptyChart({ text }: { text: string }) {
  return <div className="flex h-[200px] items-center justify-center rounded-xl bg-canvas text-sm text-muted">{text}</div>
}

type TooltipPayload = { name?: string; value?: number; color?: string; payload?: { fill?: string } }

function MoneyTooltip({ active, payload, label, currency }: { active?: boolean; payload?: TooltipPayload[]; label?: string; currency: CurrencyCode }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="num flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-semibold">{formatCurrency(p.value ?? 0, currency)}</span>
        </p>
      ))}
    </div>
  )
}

function RecentTable({ txs, currency }: { txs: Transaction[]; currency: CurrencyCode }) {
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-2 pb-3 font-semibold">Transaction</th>
            <th className="hidden px-2 pb-3 font-semibold sm:table-cell">Category</th>
            <th className="hidden px-2 pb-3 font-semibold md:table-cell">Date</th>
            <th className="px-2 pb-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {txs.map((t) => (
            <tr key={t.id}>
              <td className="px-2 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full" style={{ background: t.type === 'income' ? '#16A34A' : (CATEGORY_COLORS[t.category] ?? '#94A3B8') }} aria-hidden="true" />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted sm:hidden">{t.category}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-2 py-3 text-muted sm:table-cell">{t.category}</td>
              <td className="num hidden px-2 py-3 text-muted md:table-cell">{new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
              <td className={`num px-2 py-3 text-right font-semibold ${t.type === 'income' ? 'text-positive' : ''}`}>
                <span className="sr-only">{t.type === 'income' ? 'Income' : 'Expense'} </span>
                {t.type === 'income' ? '+' : '−'}
                {formatCurrency(t.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Highlights the category that grew most vs last month, computed locally.
 * Labelled as a calculated insight — Gemini-written insights replace this in
 * the AI milestone.
 */
function InsightCard() {
  const { transactions, month, currency, goals } = useFinance()
  const [focus, setFocus] = useState(0)

  const candidates = useMemo(() => {
    const now = new Map(expensesByCategory(inMonth(transactions, month)).map((c) => [c.category, c.amount]))
    const before = new Map(expensesByCategory(inMonth(transactions, shiftMonth(month, -1))).map((c) => [c.category, c.amount]))
    return [...now.entries()]
      .filter(([cat, amt]) => (before.get(cat) ?? 0) > 0 && amt > 500 && cat !== 'Housing')
      .map(([cat, amt]) => ({ category: cat, amount: amt, change: percentChange(amt, before.get(cat)!) ?? 0 }))
      .filter((c) => c.change > 0)
      .sort((a, b) => b.change - a.change)
  }, [transactions, month])

  const pick = candidates.length ? candidates[focus % candidates.length] : null
  const topGoal = [...goals].sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority])[0]
  const cut = pick ? round2(Math.max(100, Math.round((pick.amount * 0.15) / 100) * 100)) : 0

  return (
    <section id="insight" className="relative scroll-mt-28 overflow-hidden rounded-2xl bg-navy p-6 text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ai/40 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><Sparkles className="h-4 w-4 text-violet-300" /></span>
            Finora insight
          </span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Calculated · not AI</span>
        </div>

        {pick ? (
          <>
            <p className="mt-5 text-lg leading-relaxed">
              Your <strong className="text-violet-200">{pick.category.toLowerCase()}</strong> spending rose{' '}
              <strong className="num">{pick.change.toFixed(0)}%</strong> vs. last month to{' '}
              <span className="num">{formatCurrency(pick.amount, currency)}</span>.
              {topGoal && (
                <>
                  {' '}Trimming about <span className="num font-semibold">{formatCurrency(cut, currency)}</span> a month would add{' '}
                  <span className="num">{formatCurrency(cut * 6, currency)}</span> to your {topGoal.name.toLowerCase()} over six months.
                </>
              )}
            </p>
            {candidates.length > 1 && (
              <button onClick={() => setFocus((f) => f + 1)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 hover:underline">
                <RefreshCw className="h-3.5 w-3.5" /> Show another ({(focus % candidates.length) + 1}/{candidates.length})
              </button>
            )}
          </>
        ) : (
          <p className="mt-5 leading-relaxed text-slate-300">
            No category grew compared with last month — spending is steady. Add more transactions to surface trends.
          </p>
        )}

        <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400">
          This highlight is computed directly from your transactions. Gemini-written insights and
          the Finora AI chat are arriving in the next release. Guidance only, not financial advice.
        </p>
      </div>
    </section>
  )
}

function Onboarding({ onAdd, dialog }: { onAdd: () => void; dialog: React.ReactNode }) {
  return (
    <div className="card mx-auto mt-10 max-w-xl p-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Wallet className="h-6 w-6" /></span>
      <h2 className="mt-5 font-display text-2xl font-semibold">Let's add your first numbers</h2>
      <p className="mt-2 text-muted">Log your income and a few expenses and your dashboard fills in automatically.</p>
      <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">
        <Plus className="h-4 w-4" /> Enter financial information
      </button>
      {dialog}
    </div>
  )
}
