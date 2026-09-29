export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const text = tone === 'light' ? 'text-white' : 'text-ink'
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill={tone === 'light' ? '#1E2A47' : '#0F172A'} />
        <path d="M10 22V10h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M10 16h8" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        <circle cx="22" cy="21" r="2.5" fill="#22C55E" />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight ${text}`}>Finora</span>
    </span>
  )
}
