import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { z } from 'zod'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/finance'
import type { Transaction, TransactionType } from '@/lib/finance'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  name: z.string().trim().min(2, 'Give it a name of at least 2 characters').max(80, 'Keep the name under 80 characters'),
  amount: z
    .number({ error: 'Enter an amount' })
    .positive('Amount must be greater than zero')
    .max(100_000_000, 'That amount looks too large'),
  category: z.string().min(1, 'Choose a category'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
    .refine((d) => !Number.isNaN(new Date(d).getTime()), 'Pick a valid date')
    .refine((d) => new Date(d) <= new Date(Date.now() + 86_400_000 * 366), 'Date is too far in the future'),
  paymentMethod: z.string().min(1, 'Choose a payment method'),
  description: z.string().trim().max(240, 'Keep notes under 240 characters').optional(),
})

type Errors = Partial<Record<keyof Transaction, string>>

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TransactionDialog({
  open,
  initial,
  defaultType = 'expense',
  onClose,
  onSave,
}: {
  open: boolean
  initial?: Transaction | null
  defaultType?: TransactionType
  onClose: () => void
  onSave: (t: Omit<Transaction, 'id'>) => void
}) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(today())
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const firstField = useRef<HTMLInputElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    setType(initial?.type ?? defaultType)
    setName(initial?.name ?? '')
    setAmount(initial ? String(initial.amount) : '')
    setCategory(initial?.category ?? '')
    setDate(initial?.date ?? today())
    setPaymentMethod(initial?.paymentMethod ?? 'UPI')
    setDescription(initial?.description ?? '')
    setErrors({})
    const t = setTimeout(() => firstField.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, initial, defaultType])

  if (!open) return null

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = transactionSchema.safeParse({
      type,
      name,
      amount: amount === '' ? undefined : Number(amount),
      category,
      date,
      paymentMethod,
      description: description || undefined,
    })
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Transaction
        if (!next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }
    onSave({ ...parsed.data, amount: Math.round(parsed.data.amount * 100) / 100 })
  }

  const field = 'mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15'
  const border = (k: keyof Transaction) => (errors[k] ? 'border-danger' : 'border-line')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="tx-title">
      <button className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]" aria-label="Close dialog" onClick={onClose} tabIndex={-1} />
      <form onSubmit={submit} noValidate className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-rise sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="tx-title" className="text-lg font-semibold">
            {initial ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <fieldset className="mb-4">
          <legend className="text-sm font-medium">Type</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
            {(['expense', 'income'] as const).map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-lg py-2 text-center text-sm font-semibold capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                  type === t ? (t === 'income' ? 'bg-white text-positive shadow-sm' : 'bg-white text-danger shadow-sm') : 'text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => {
                    setType(t)
                    setCategory('')
                  }}
                  className="sr-only"
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="tx-name" className="text-sm font-medium">Name</label>
            <input ref={firstField} id="tx-name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} ${border('name')}`} placeholder={type === 'income' ? 'e.g. Salary — Lumen Analytics' : 'e.g. BigBasket weekly order'} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
            <FieldError id="err-name" msg={errors.name} />
          </div>
          <div>
            <label htmlFor="tx-amount" className="text-sm font-medium">Amount</label>
            <input id="tx-amount" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${field} num ${border('amount')}`} placeholder="0" aria-invalid={!!errors.amount} aria-describedby={errors.amount ? 'err-amount' : undefined} />
            <FieldError id="err-amount" msg={errors.amount} />
          </div>
          <div>
            <label htmlFor="tx-date" className="text-sm font-medium">Date</label>
            <input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${field} ${border('date')}`} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'err-date' : undefined} />
            <FieldError id="err-date" msg={errors.date} />
          </div>
          <div>
            <label htmlFor="tx-category" className="text-sm font-medium">Category</label>
            <select id="tx-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} ${border('category')}`} aria-invalid={!!errors.category} aria-describedby={errors.category ? 'err-category' : undefined}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError id="err-category" msg={errors.category} />
          </div>
          <div>
            <label htmlFor="tx-method" className="text-sm font-medium">Payment method</label>
            <select id="tx-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`${field} ${border('paymentMethod')}`}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tx-desc" className="text-sm font-medium">
              Notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea id="tx-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} h-auto py-2.5 ${border('description')}`} />
            <FieldError id="err-desc" msg={errors.description} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl px-5 text-sm font-semibold text-muted hover:bg-canvas hover:text-ink">
            Cancel
          </button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-blue-700">
            {initial ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null
  return (
    <p id={id} className="mt-1 text-xs font-medium text-danger">
      {msg}
    </p>
  )
}
