import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  FileText,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium text-muted">
          <a href="#how" className="hidden sm:inline hover:text-ink">How it works</a>
          <a href="#privacy" className="hidden sm:inline hover:text-ink">Privacy</a>
          <Link
            to="/app"
            className="rounded-full bg-navy px-4 py-2 text-white transition hover:bg-navy-700"
          >
            Open demo
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ai">
            <Sparkles className="h-3.5 w-3.5" /> Meet Finora AI, your personal finance assistant
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Take control of your finances <em className="text-brand not-italic">with AI.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Build smarter budgets, save more effectively, and understand your money with your
            personal AI finance assistant.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/app"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-blue-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/app/finances"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 font-semibold text-ink transition hover:border-slate-300"
            >
              Explore with sample data
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted">
            No account needed — the demo runs on clearly labelled sample data.
          </p>
        </div>

        <HeroPreview />
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">How it works</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                From your numbers to a plan you can follow.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                You enter income, expenses and goals. Finora does the arithmetic, then asks
                Google Gemini to turn it into guidance — grounded in your data, never invented.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              <Step n="01" icon={Wallet} title="Your inputs" body="Income, categorised expenses, current savings and the goals you care about." />
              <Step n="02" icon={Sparkles} title="Finora AI" body="A secure server-side call to Gemini with only the figures it needs." accent />
              <Step n="03" icon={PiggyBank} title="Budget plan & savings" body="Category limits that fit your income, plus specific ways to save more." />
              <Step n="04" icon={FileText} title="Monthly summary report" body="What changed, what worked and what to do next month — printable and exportable." />
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-5 md:grid-cols-6">
          <Feature className="md:col-span-4" icon={BarChart3} title="A dashboard that actually adds up">
            Income, spending, savings rate and goal progress — calculated from every transaction
            you log, with trends against last month.
          </Feature>
          <Feature className="md:col-span-2" icon={Target} title="Goals with a monthly number">
            Know exactly how much to set aside to hit each target date.
          </Feature>
          <Feature className="md:col-span-2" icon={CalendarRange} title="Budget vs. actual">
            See which categories are on track and which are drifting.
          </Feature>
          <Feature className="md:col-span-4" icon={Sparkles} title="Ask Finora anything about your money" ai>
            “Where am I spending too much?” “Can I afford the Japan trip by November?” Answers
            reference your own figures and explain their assumptions.
          </Feature>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-12 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
                Your API keys and personal details stay on the server.
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">
                AI requests go through Netlify Functions, so the Gemini key is never shipped to the
                browser. Finora sends aggregated figures and categories — never passwords, tokens or
                unrelated personal information. Suggestions are guidance, not guaranteed outcomes or
                licensed financial advice.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              {['Server-side Gemini calls only', 'Minimal data sent to the model', 'Confirmation before any deletion'].map((t) => (
                <div key={t} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <Lock className="h-4 w-4 text-sky-300" /> {t}
                </div>
              ))}
              <Link to="/app" className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-navy transition hover:bg-slate-100">
                Open the demo dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-8">
          <Logo />
          <p>Finora provides educational guidance, not licensed financial advice.</p>
        </div>
      </footer>
    </div>
  )
}

function Step({
  n,
  icon: Icon,
  title,
  body,
  accent,
}: {
  n: string
  icon: typeof Wallet
  title: string
  body: string
  accent?: boolean
}) {
  return (
    <li className={`rounded-2xl border p-6 ${accent ? 'border-ai/20 bg-ai-soft' : 'border-line bg-canvas'}`}>
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${accent ? 'text-ai' : 'text-brand'}`} />
        <span className="num text-xs font-semibold text-muted">{n}</span>
      </div>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  )
}

function Feature({
  icon: Icon,
  title,
  children,
  className = '',
  ai,
}: {
  icon: typeof Wallet
  title: string
  children: React.ReactNode
  className?: string
  ai?: boolean
}) {
  return (
    <div className={`card p-7 ${className}`}>
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${ai ? 'bg-ai-soft text-ai' : 'bg-brand-soft text-brand'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{children}</p>
    </div>
  )
}

/** Static illustration of the dashboard — sample figures, for the hero only. */
function HeroPreview() {
  const bars = [62, 71, 58, 80, 67, 74]
  return (
    <div className="relative animate-rise [animation-delay:120ms]" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand/10 via-transparent to-emerald-200/40" />
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <span className="text-sm font-semibold">September overview</span>
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">Sample data</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {[
            ['Income', '₹1,08,540', 'text-positive'],
            ['Expenses', '₹76,212', 'text-ink'],
            ['Saved', '29.8%', 'text-brand'],
          ].map(([l, v, c]) => (
            <div key={l} className="px-5 py-4">
              <p className="text-xs text-muted">{l}</p>
              <p className={`num mt-1 text-lg font-semibold ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex h-40 items-end gap-3 px-6 pb-5 pt-6">
          {bars.map((h, i) => (
            <div key={i} className="flex flex-1 items-end gap-1">
              <div className="flex-1 rounded-t-md bg-brand" style={{ height: `${h + 18}%` }} />
              <div className="flex-1 rounded-t-md bg-slate-200" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="card absolute -bottom-8 -left-4 w-72 p-4 sm:-left-10">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai-soft text-ai">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-sm leading-snug text-ink">
            Dining is up 12% this month. Cutting ₹1,000 gets your emergency fund there five weeks
            sooner.
          </p>
        </div>
      </div>
    </div>
  )
}
