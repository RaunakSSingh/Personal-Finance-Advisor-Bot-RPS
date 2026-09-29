import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

/** Recharts measures the DOM, so charts render only after mount. */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return <>{mounted ? children : fallback}</>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * Change badge. `goodWhenUp` flips the colour for metrics where a rise is bad
 * (expenses). Arrow + sign keep meaning without relying on colour.
 */
export function Delta({ value, goodWhenUp = true }: { value: number | null; goodWhenUp?: boolean }) {
  if (value === null) {
    return <span className="text-xs text-muted">No prior month</span>
  }
  const flat = Math.abs(value) < 0.5
  const good = flat ? null : value > 0 === goodWhenUp
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const tone = good === null ? 'bg-slate-100 text-muted' : good ? 'bg-positive-soft text-positive' : 'bg-danger-soft text-danger'
  return (
    <span className={`num inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {value > 0 ? '+' : ''}
      {value.toFixed(1)}%<span className="sr-only"> vs previous month</span>
    </span>
  )
}

export function ProgressBar({ value, tone = 'brand', label }: { value: number; tone?: 'brand' | 'positive' | 'warning' | 'danger'; label: string }) {
  const color = { brand: 'bg-brand', positive: 'bg-positive', warning: 'bg-warning', danger: 'bg-danger' }[tone]
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}
