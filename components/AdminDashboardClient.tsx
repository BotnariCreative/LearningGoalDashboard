'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GrainTexture } from './GrainTexture'
import type { Goal, CategoryWithGoals } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const TRACKS = ['ALL', 'APP', 'AI', 'CCS', 'DI']

const STATUS_OPTIONS = [
  { value: '', label: 'Not Started' },
  { value: 'td', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const

interface AdminDashboardClientProps {
  categories: CategoryWithGoals[]
}

interface GoalState {
  status: '' | 'td' | 'done'
  project: string
  bewijs: string
}

function AdminGoalRow({ goal, onSaved }: { goal: Goal; onSaved: (id: string, data: GoalState) => void }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(goal.status)

  async function quickStatus(next: '' | 'td' | 'done') {
    setStatus(next)
    setSaving(true)
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      onSaved(goal.id, { status: next, project: goal.project, bewijs: goal.bewijs })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-white/10 py-4 px-2 last:border-b-0">
      <div className="flex shrink-0 items-center gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => quickStatus(opt.value)}
            disabled={saving}
            title={opt.label}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              status === opt.value
                ? opt.value === 'done'
                  ? 'bg-white/85'
                  : opt.value === 'td'
                    ? 'bg-white/50'
                    : 'bg-white/20 ring-1 ring-white/20'
                : 'bg-white/8 hover:bg-white/20'
            }`}
          />
        ))}
      </div>

      {goal.number && (
        <span className="shrink-0 font-mono text-xs tracking-widest text-white/25">
          {goal.number}
        </span>
      )}

      <span className="min-w-0 flex-1 line-clamp-1 text-sm text-white/70">{goal.text}</span>

      <div className="flex shrink-0 items-center gap-2">
        {goal.types.slice(0, 2).map((t) => (
          <span key={t} className="hidden rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/30 sm:inline">
            {t}
          </span>
        ))}

        <Link
          href={`/admin/goals/${goal.id}`}
          className="text-xs font-bold tracking-[0.12em] uppercase text-white/30 transition-colors hover:text-white/70"
        >
          DOCS →
        </Link>
      </div>
    </div>
  )
}

export function AdminDashboardClient({ categories: initial }: AdminDashboardClientProps) {
  const [activeTrack, setActiveTrack] = useState('ALL')
  const [categories, setCategories] = useState(initial)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(initial.map((c) => c.key)))
  const [loggingOut, setLoggingOut] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const allGoals = categories.flatMap((c) => c.goals)
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter((g) => g.status === 'done' || g.verified === 'yes').length
  const verifiedGoals = allGoals.filter((g) => g.verified === 'yes').length
  const overallPct = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      goals:
        activeTrack === 'ALL'
          ? cat.goals
          : cat.goals.filter((g) => g.types.includes(activeTrack)),
    }))
    .filter((cat) => cat.goals.length > 0)

  const handleSaved = useCallback((goalId: string, data: GoalState) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        goals: cat.goals.map((g) =>
          g.id === goalId ? { ...g, ...data } : g
        ),
      }))
    )
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const statEls = heroRef.current?.querySelectorAll('[data-stat]') ?? []
      statEls.forEach((el) => {
        const target = parseInt(el.getAttribute('data-stat') || '0')
        gsap.fromTo(
          el,
          { innerText: 0 },
          { innerText: target, duration: 1.6, ease: 'power2.out', snap: { innerText: 1 }, delay: 0.4 }
        )
      })
      gsap.from(heroRef.current, { y: 24, opacity: 0, duration: 1, ease: 'power3.out' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-40 px-4">
        <nav className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.35em] uppercase text-white/70">LEARNING GOALS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70">
              ← PUBLIC
            </Link>
            <button
              onClick={logout}
              disabled={loggingOut}
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70 disabled:opacity-40"
            >
              LOGOUT
            </button>
          </div>
        </nav>
      </header>

      {/* Stats row + progress */}
      <div className="px-6 mt-30" ref={heroRef}>
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-10 mb-10">
            <div>
              <p className="font-mono text-4xl font-black text-white sm:text-5xl" data-stat={totalGoals}>{totalGoals}</p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">TOTAL</p>
            </div>
            <div>
              <p className="font-mono text-4xl font-black text-white sm:text-5xl" data-stat={completedGoals}>{completedGoals}</p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">COMPLETED</p>
            </div>
            <div>
              <p className="font-mono text-4xl font-black text-white sm:text-5xl" data-stat={verifiedGoals}>{verifiedGoals}</p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">VERIFIED</p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase text-white/40">OVERALL PROGRESS</span>
            <span className="font-mono text-xs text-white/40">{Math.round(overallPct)}%</span>
          </div>
          <div className="h-px w-full overflow-hidden rounded-full mb-5 bg-white/10">
            <div
              className="h-full rounded-full bg-white/70 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Track filter */}
      <section className="sticky top-20 z-30 px-6 pb-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TRACKS.map((track) => (
              <button
                key={track}
                onClick={() => setActiveTrack(track)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                  activeTrack === track
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <main className="px-6 pb-20">
        <div className="mx-auto max-w-5xl space-y-4">
          {filteredCategories.map((cat) => {
            const doneCount = cat.goals.filter(
              (g) => g.status === 'done' || g.verified === 'yes'
            ).length
            const total = cat.goals.length
            const pct = total > 0 ? (doneCount / total) * 100 : 0
            const numStr = String(cat.number).padStart(2, '0')
            const isExpanded = expandedCats.has(cat.key)

            return (
              <div
                key={cat.key}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md"
              >
                <GrainTexture id={`admin-cat-${cat.number}`} />

                <div className="relative z-10 flex items-center gap-4 px-6 py-5">
                  <span className="font-mono text-3xl font-black tracking-tight text-white/10 select-none">
                    {numStr}.
                  </span>
                  <div className="flex-1">
                    <h2 className="text-base font-black tracking-tight text-white/90">{cat.name}</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-px flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white/60 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 font-mono text-xs text-white/30">
                        {doneCount}/{total}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedCats((prev) => {
                        const next = new Set(prev)
                        if (next.has(cat.key)) next.delete(cat.key)
                        else next.add(cat.key)
                        return next
                      })
                    }
                    className="shrink-0 text-xs font-bold tracking-[0.15em] uppercase text-white/30 transition-colors hover:text-white/70"
                  >
                    {isExpanded ? '↑ HIDE' : '↓ SHOW'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="relative z-10 px-4 pb-2">
                    {cat.goals.map((goal) => (
                      <AdminGoalRow key={goal.id} goal={goal} onSaved={handleSaved} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
