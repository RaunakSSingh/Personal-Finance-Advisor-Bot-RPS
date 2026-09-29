// Demo-mode sample data. Everything the product renders today is seeded from
// this module so a later milestone can swap it for real persistence.
import type { CategoryBudget, SavingsGoal, Transaction } from './finance'
import { monthKey, shiftMonth } from './finance'

export const DEMO_PROFILE = {
  name: 'Aanya Kapoor',
  email: 'aanya.kapoor@example.com',
  currency: 'INR' as const,
  region: 'India',
}

type Template = {
  name: string
  type: Transaction['type']
  category: string
  base: number
  day: number
  paymentMethod: string
  // multiplier per month offset (0 = oldest) to give realistic variance
  drift?: number[]
  description?: string
}

const TEMPLATES: Template[] = [
  { name: 'Salary — Lumen Analytics', type: 'income', category: 'Salary', base: 92500, day: 1, paymentMethod: 'Bank transfer' },
  { name: 'Freelance UX audit', type: 'income', category: 'Freelance', base: 14200, day: 18, paymentMethod: 'Bank transfer', drift: [0.6, 0, 1.1, 0.8, 1.35, 1] },
  { name: 'Mutual fund dividend', type: 'income', category: 'Investments', base: 1840, day: 22, paymentMethod: 'Bank transfer', drift: [1, 0, 0, 1.2, 0, 1.05] },
  { name: 'Apartment rent — Indiranagar', type: 'expense', category: 'Housing', base: 28000, day: 3, paymentMethod: 'Bank transfer' },
  { name: 'BigBasket weekly order', type: 'expense', category: 'Groceries', base: 3120, day: 5, paymentMethod: 'UPI', drift: [0.92, 1.04, 0.97, 1.1, 0.95, 1.08] },
  { name: 'Nature’s Basket', type: 'expense', category: 'Groceries', base: 2465, day: 19, paymentMethod: 'Debit card', drift: [1, 0.88, 1.12, 0.9, 1.06, 1.14] },
  { name: 'Metro card top-up', type: 'expense', category: 'Transportation', base: 1500, day: 4, paymentMethod: 'UPI' },
  { name: 'Uber rides', type: 'expense', category: 'Transportation', base: 2280, day: 16, paymentMethod: 'Credit card', drift: [0.8, 1.1, 0.95, 1.3, 1.05, 1.18] },
  { name: 'BESCOM electricity', type: 'expense', category: 'Utilities', base: 1870, day: 8, paymentMethod: 'Auto-debit', drift: [1.2, 1.35, 1.1, 0.95, 0.9, 1.02] },
  { name: 'ACT Fibernet', type: 'expense', category: 'Utilities', base: 1179, day: 10, paymentMethod: 'Auto-debit' },
  { name: 'Apollo Pharmacy', type: 'expense', category: 'Healthcare', base: 860, day: 12, paymentMethod: 'UPI', drift: [0.5, 1.4, 0.7, 0, 2.1, 0.9] },
  { name: 'Coursera Plus', type: 'expense', category: 'Education', base: 3499, day: 14, paymentMethod: 'Credit card', drift: [0, 0, 1, 0, 0, 1] },
  { name: 'PVR Cinemas', type: 'expense', category: 'Entertainment', base: 1240, day: 13, paymentMethod: 'Credit card', drift: [1, 0.6, 1.4, 1.1, 0.8, 1.3] },
  { name: 'Toit Brewpub', type: 'expense', category: 'Dining', base: 2860, day: 9, paymentMethod: 'Credit card', drift: [0.85, 0.95, 1, 0.9, 1.05, 1.22] },
  { name: 'Swiggy orders', type: 'expense', category: 'Dining', base: 3340, day: 21, paymentMethod: 'UPI', drift: [0.9, 1.02, 0.94, 1.08, 1, 1.12] },
  { name: 'Myntra order', type: 'expense', category: 'Shopping', base: 4190, day: 17, paymentMethod: 'Credit card', drift: [0.6, 1.3, 0.4, 1.7, 0.9, 0.75] },
  { name: 'Star Health premium', type: 'expense', category: 'Insurance', base: 2150, day: 6, paymentMethod: 'Auto-debit' },
  { name: 'Spotify + Netflix', type: 'expense', category: 'Subscriptions', base: 768, day: 2, paymentMethod: 'Credit card' },
  { name: 'Weekend trip — Coorg', type: 'expense', category: 'Travel', base: 11800, day: 24, paymentMethod: 'Credit card', drift: [0, 1, 0, 0, 0.7, 0] },
]

/** Six months of transactions ending in the given month (defaults to now). */
export function buildDemoTransactions(now: Date = new Date()): Transaction[] {
  const current = monthKey(now)
  const today = now.getDate()
  const txs: Transaction[] = []
  for (let offset = 0; offset < 6; offset++) {
    const key = shiftMonth(current, offset - 5)
    const isCurrent = key === current
    TEMPLATES.forEach((t, i) => {
      const mult = t.drift ? t.drift[offset] : 1
      if (mult === 0) return
      if (isCurrent && t.day > Math.max(today, 1)) return
      txs.push({
        id: `demo-${key}-${i}`,
        type: t.type,
        name: t.name,
        amount: Math.round(t.base * mult),
        category: t.category,
        date: `${key}-${String(t.day).padStart(2, '0')}`,
        paymentMethod: t.paymentMethod,
        description: t.description,
      })
    })
  }
  return txs.sort((a, b) => b.date.localeCompare(a.date))
}

export function buildDemoGoals(now: Date = new Date()): SavingsGoal[] {
  const y = now.getFullYear()
  return [
    { id: 'goal-emergency', name: 'Emergency fund', targetAmount: 350000, currentAmount: 214600, targetDate: `${y + 1}-03-31`, category: 'Emergency', priority: 'high' },
    { id: 'goal-laptop', name: 'MacBook Pro upgrade', targetAmount: 185000, currentAmount: 62300, targetDate: `${y + 1}-06-30`, category: 'Purchase', priority: 'medium' },
    { id: 'goal-japan', name: 'Japan trip', targetAmount: 240000, currentAmount: 48750, targetDate: `${y + 1}-11-15`, category: 'Travel', priority: 'low' },
  ]
}

export const DEMO_BUDGET: CategoryBudget[] = [
  { category: 'Housing', limit: 28000 },
  { category: 'Groceries', limit: 6000 },
  { category: 'Transportation', limit: 4000 },
  { category: 'Utilities', limit: 3200 },
  { category: 'Healthcare', limit: 1500 },
  { category: 'Education', limit: 3500 },
  { category: 'Entertainment', limit: 1500 },
  { category: 'Dining', limit: 5500 },
  { category: 'Shopping', limit: 3500 },
  { category: 'Insurance', limit: 2150 },
  { category: 'Subscriptions', limit: 800 },
  { category: 'Travel', limit: 4000 },
]
