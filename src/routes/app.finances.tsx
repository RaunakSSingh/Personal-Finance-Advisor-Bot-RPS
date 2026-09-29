import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Download, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { TransactionDialog } from '@/components/TransactionDialog'
import { useToast } from '@/components/Toast'
import { useFinance } from '@/lib/store'
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency, summarize } from '@/lib/finance'
import type { Transaction, TransactionType } from '@/lib/finance'

type Search = { q?: string }

export const Route = createFileRoute('/app/finances')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === 'string' && s.q ? s.q : undefined,
  }),
  component: MyFinances,
})

type Sort = 'newest' | 'oldest' | 'highest' | 'lowest'
const PAGE_SIZE = 12

function MyFinances() {
  const { transactions, currency, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const { q: initialQ } = Route.useSearch()
  const navigate = useNavigate({ from: '/app/finances' })
  const toast = useToast()

  const [q, setQ] = useState(initialQ ?? '')
  const [type, setType] = useState<'all' | TransactionType>('all')
  const [category, setCategory] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [dialog, setDialog] = useState<{ open: boolean; tx: Transaction | null; type: TransactionType }>({ open: false, tx: null, type: 'expense' })
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)

  useEffect(() => setQ(initialQ ?? ''), [initialQ])
  useEffect(() => setPage(1), [q, type, category, from, to, sort])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = transactions.filter(
      (t) =>
        (!needle || t.name.toLowerCase().includes(needle) || t.category.toLowerCase().includes(needle)) &&
        (type === 'all' || t.type === type) &&
        (!category || t.category === category) &&
        (!from || t.date >= from) &&
        (!to || t.date <= to),
    )
    const cmp: Record<Sort, (a: Transaction, b: Transaction) => number> = {
      newest: (a, b) => b.date.localeCompare(a.date),
      oldest: (a, b) => a.date.localeCompare(b.date),
      highest: (a, b) => b.amount - a.amount,
      lowest: (a, b) => a.amount - b.amount,
    }
    return [...list].sort(cmp[sort])
  }, [transactions, q, type, category, from, to, sort])

  const totals = useMemo(() => summarize(filtered), [filtered])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const filtersActive = !!(q || type !== 'all' || category || from || to)
  const fmt = (n: number) => formatCurrency(n, currency)

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : type === 'expense' ? EXPENSE_CATEGORIES : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

  function clearFilters() {
    setQ('')
    setType('all')
    setCategory('')
    setFrom('')
    setTo('')
    navigate({ search: {} })
  }

  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = [
      ['Date', 'Type', 'Name', 'Category', 'Payment method', `Amount (${currency})`, 'Notes'],
      ...filtered.map((t) => [t.date, t.type, t.name, t.category, t.paymentMethod, t.amount.toFixed(2), t.description ?? '']),
    ]
    const csv = rows.map((r) => r.map((c) => esc(String(c))).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `finora-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${filtered.length} transactions`)
  }

  const input = 'h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-rise">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">My finances</h2>
          <p className="mt-1.5 text-muted">Every income source and expense in one place. Totals reflect the filters you apply.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDialog({ open: true, tx: null, type: 'income' })} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:border-slate-300">
            <ArrowDownLeft className="h-4 w-4 text-positive" /> Add income
          </button>
          <button onClick={() => setDialog({ open: true, tx: null, type: 'expense' })} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add expense
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Summary label="Total income" value={fmt(totals.income)} tone="text-positive" />
        <Summary label="Total expenses" value={fmt(totals.expenses)} tone="text-ink" />
        <Summary label="Net savings" value={fmt(totals.netSavings)} tone={totals.netSavings < 0 ? 'text-danger' : 'text-brand'} hint={totals.savingsRate === null ? undefined : `${totals.savingsRate.toFixed(1)}% of income`} />
        <Summary label="Transactions" value={String(totals.count)} tone="text-ink" hint={filtersActive ? `of ${transactions.length} total` : undefined} />
      </div>

      {/* Toolbar */}
      <section className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <label htmlFor="f-q" className="sr-only">Search by name</label>
            <input id="f-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or category" className={`${input} w-full pl-9`} />
          </div>
          <div className="flex rounded-xl bg-canvas p-1" role="tablist" aria-label="Transaction type">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={type === t}
                onClick={() => {
                  setType(t)
                  setCategory('')
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${type === t ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
              >
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
          <label htmlFor="f-sort" className="sr-only">Sort</label>
          <select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={input}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
          <button onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${showFilters ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-white'}`}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold disabled:opacity-40">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-3 border-b border-line bg-canvas/60 p-4 sm:grid-cols-4">
            <div>
              <label htmlFor="f-cat" className="text-xs font-semibold text-muted">Category</label>
              <select id="f-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} mt-1 w-full`}>
                <option value="">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-from" className="text-xs font-semibold text-muted">From</label>
              <input id="f-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={`${input} mt-1 w-full`} />
            </div>
            <div>
              <label htmlFor="f-to" className="text-xs font-semibold text-muted">To</label>
              <input id="f-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={`${input} mt-1 w-full`} />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} disabled={!filtersActive} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted hover:text-ink disabled:opacity-40">
                <X className="h-4 w-4" /> Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold">{transactions.length === 0 ? 'No transactions yet' : 'Nothing matches these filters'}</p>
            <p className="max-w-sm text-sm text-muted">
              {transactions.length === 0 ? 'Add your income and expenses to see totals and trends.' : 'Try widening the date range or clearing the search.'}
            </p>
            {filtersActive ? (
              <button onClick={clearFilters} className="mt-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold">Clear filters</button>
            ) : (
              <button onClick={() => setDialog({ open: true, tx: null, type: 'expense' })} className="mt-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Add transaction</button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line" aria-label="Transactions">
            {visible.map((t) => (
              <li key={t.id} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-canvas/70 sm:gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: t.type === 'income' ? '#E7F6EC' : `${CATEGORY_COLORS[t.category] ?? '#94A3B8'}1A`, color: t.type === 'income' ? '#16A34A' : CATEGORY_COLORS[t.category] ?? '#64748B' }}
                  aria-hidden="true"
                >
                  {t.type === 'income' ? <ArrowDownLeft className="h-[18px] w-[18px]" /> : <ArrowUpRight className="h-[18px] w-[18px]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className={`rounded-md px-1.5 py-0.5 font-semibold ${t.type === 'income' ? 'bg-positive-soft text-positive' : 'bg-slate-100 text-slate-600'}`}>
                      {t.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                    <span>{t.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="num">{new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                    <span className="hidden sm:inline">{t.paymentMethod}</span>
                  </p>
                </div>
                <p className={`num shrink-0 text-right font-semibold ${t.type === 'income' ? 'text-positive' : ''}`}>
                  {t.type === 'income' ? '+' : '−'}
                  {fmt(t.amount)}
                </p>
                <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button onClick={() => setDialog({ open: true, tx: t, type: t.type })} className="rounded-lg p-2 text-muted hover:bg-white hover:text-brand" aria-label={`Edit ${t.name}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPendingDelete(t)} className="rounded-lg p-2 text-muted hover:bg-white hover:text-danger" aria-label={`Delete ${t.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="flex items-center justify-between border-t border-line px-4 py-3 text-sm" aria-label="Pagination">
            <span className="num text-muted">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
            </div>
          </nav>
        )}
      </section>

      <TransactionDialog
        open={dialog.open}
        initial={dialog.tx}
        defaultType={dialog.type}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        onSave={(data) => {
          if (dialog.tx) {
            updateTransaction({ ...data, id: dialog.tx.id })
            toast('Transaction updated')
          } else {
            addTransaction(data)
            toast(data.type === 'income' ? 'Income added' : 'Expense added')
          }
          setDialog((d) => ({ ...d, open: false }))
        }}
      />

      {pendingDelete && (
        <ConfirmDelete
          tx={pendingDelete}
          amount={fmt(pendingDelete.amount)}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteTransaction(pendingDelete.id)
            setPendingDelete(null)
            toast('Transaction deleted', 'info')
          }}
        />
      )}
    </div>
  )
}

function Summary({ label, value, tone, hint }: { label: string; value: string; tone: string; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`num mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

function ConfirmDelete({ tx, amount, onCancel, onConfirm }: { tx: Transaction; amount: string; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc">
      <button className="absolute inset-0 bg-navy/40" aria-label="Cancel" onClick={onCancel} tabIndex={-1} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-rise">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-soft text-danger"><AlertTriangle className="h-5 w-5" /></span>
        <h2 id="del-title" className="mt-4 text-lg font-semibold">Delete this transaction?</h2>
        <p id="del-desc" className="mt-1.5 text-sm text-muted">
          “{tx.name}” ({amount}) will be removed and every total will update. This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button autoFocus onClick={onCancel} className="h-10 rounded-xl px-4 text-sm font-semibold text-muted hover:bg-canvas">Cancel</button>
          <button onClick={onConfirm} className="h-10 rounded-xl bg-danger px-4 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  )
}
