// Core finance types, categories and calculations shared across screens.

export type TransactionType = 'income' | 'expense'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP'

export interface Transaction {
  id: string
  type: TransactionType
  name: string
  amount: number
  category: string
  date: string // ISO yyyy-mm-dd
  paymentMethod: string
  description?: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

export interface CategoryBudget {
  category: string
  limit: number
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental',
  'Other income',
] as const

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Education',
  'Entertainment',
  'Dining',
  'Shopping',
  'Insurance',
  'Subscriptions',
  'Travel',
  'Other',
] as const

export const PAYMENT_METHODS = [
  'UPI',
  'Debit card',
  'Credit card',
  'Bank transfer',
  'Cash',
  'Auto-debit',
] as const

// One colour per expense category — fixed order so charts stay consistent.
export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#2563EB',
  Groceries: '#16A34A',
  Transportation: '#F59E0B',
  Utilities: '#0EA5E9',
  Healthcare: '#EF4444',
  Education: '#7C3AED',
  Entertainment: '#EC4899',
  Dining: '#F97316',
  Shopping: '#14B8A6',
  Insurance: '#64748B',
  Subscriptions: '#8B5CF6',
  Travel: '#06B6D4',
  Other: '#94A3B8',
}

export const CURRENCIES: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', label: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB' },
]

const formatterCache = new Map<string, Intl.NumberFormat>()

export function formatCurrency(
  value: number,
  currency: CurrencyCode,
  opts: { compact?: boolean } = {},
): string {
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? 'en-IN'
  const key = `${locale}-${currency}-${opts.compact ? 'c' : 'f'}`
  let fmt = formatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: opts.compact ? 1 : 0,
      notation: opts.compact ? 'compact' : 'standard',
    })
    formatterCache.set(key, fmt)
  }
  return fmt.format(round2(value))
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** "2026-09" style key for a date string or Date. */
export function monthKey(date: string | Date): string {
  if (typeof date === 'string') return date.slice(0, 7)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthKey(d)
}

export function monthLabel(key: string, style: 'long' | 'short' = 'long'): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: style,
    year: style === 'long' ? 'numeric' : undefined,
  })
}

export function inMonth(txs: Transaction[], key: string): Transaction[] {
  return txs.filter((t) => monthKey(t.date) === key)
}

export function sumBy(txs: Transaction[], type: TransactionType): number {
  return round2(txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0))
}

export interface MonthSummary {
  income: number
  expenses: number
  netSavings: number
  savingsRate: number | null // null when there is no income to divide by
  count: number
}

export function summarize(txs: Transaction[]): MonthSummary {
  const income = sumBy(txs, 'income')
  const expenses = sumBy(txs, 'expense')
  const netSavings = round2(income - expenses)
  return {
    income,
    expenses,
    netSavings,
    savingsRate: savingsRate(netSavings, income),
    count: txs.length,
  }
}

export function savingsRate(net: number, income: number): number | null {
  if (!income || income <= 0) return null
  return round2((net / income) * 100)
}

/** Percentage change vs previous value; null when there's no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null
  return round2(((current - previous) / Math.abs(previous)) * 100)
}

export function goalProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.max(0, round2((current / target) * 100)))
}

/** Monthly contribution needed to hit a goal by its target date. */
export function monthlyNeeded(goal: SavingsGoal, from: Date = new Date()): number | null {
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0
  const target = new Date(goal.targetDate)
  const months =
    (target.getFullYear() - from.getFullYear()) * 12 + (target.getMonth() - from.getMonth())
  if (months <= 0) return null // overdue
  return round2(remaining / months)
}

export function expensesByCategory(txs: Transaction[]): { category: string; amount: number }[] {
  const map = new Map<string, number>()
  for (const t of txs) {
    if (t.type !== 'expense') continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount)
}
