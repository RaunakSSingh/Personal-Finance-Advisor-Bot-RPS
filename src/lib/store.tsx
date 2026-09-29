import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CategoryBudget, CurrencyCode, SavingsGoal, Transaction } from './finance'
import { monthKey } from './finance'
import { DEMO_BUDGET, DEMO_PROFILE, buildDemoGoals, buildDemoTransactions } from './fixtures'

// Demo-mode state container. Seeded from fixtures and held in memory; the
// storage milestone replaces the internals while keeping this API.

interface FinanceState {
  profile: typeof DEMO_PROFILE
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  month: string
  setMonth: (m: string) => void
  transactions: Transaction[]
  goals: SavingsGoal[]
  budget: CategoryBudget[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  resetDemo: () => void
  isDemo: true
}

const FinanceContext = createContext<FinanceState | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => buildDemoTransactions())
  const [goals, setGoals] = useState<SavingsGoal[]>(() => buildDemoGoals())
  const [currency, setCurrency] = useState<CurrencyCode>(DEMO_PROFILE.currency)
  const [month, setMonth] = useState(() => monthKey(new Date()))

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    setTransactions((prev) => [{ ...t, id }, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }, [])

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) =>
      prev.map((p) => (p.id === t.id ? t : p)).sort((a, b) => b.date.localeCompare(a.date)),
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const resetDemo = useCallback(() => {
    setTransactions(buildDemoTransactions())
    setGoals(buildDemoGoals())
    setMonth(monthKey(new Date()))
  }, [])

  const value = useMemo<FinanceState>(
    () => ({
      profile: DEMO_PROFILE,
      currency,
      setCurrency,
      month,
      setMonth,
      transactions,
      goals,
      budget: DEMO_BUDGET,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      resetDemo,
      isDemo: true,
    }),
    [currency, month, transactions, goals, addTransaction, updateTransaction, deleteTransaction, resetDemo],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance(): FinanceState {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside <FinanceProvider>')
  return ctx
}
