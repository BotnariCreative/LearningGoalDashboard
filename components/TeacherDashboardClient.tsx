'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { GrainTexture } from './GrainTexture'
import { StatusDot } from './StatusDot'
import { GoalDrawer } from './GoalDrawer'
import type { Goal, CategoryWithGoals } from '@/types'

const TRACKS = ['ALL', 'APP', 'AI', 'CCS', 'DI']

interface TeacherDashboardClientProps {
  categories: CategoryWithGoals[]
}

function TeacherGoalRow({
  goal,
  onVerifiedChange,
  onGoalClick,
}: {
  goal: Goal
  onVerifiedChange: (id: string, verified: string) => void
  onGoalClick: (goal: Goal) => void
}) {
  const [verified, setVerified] = useState(goal.verified)
  const [verifiedBy, setVerifiedBy] = useState(goal.verifiedBy)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function verify() {
    if (!nameInput.trim()) return
    setVerified('yes')
    setVerifiedBy(nameInput.trim())
    setSaving(true)
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: 'yes', verifiedBy: nameInput.trim() }),
      })
      onVerifiedChange(goal.id, 'yes')
    } finally {
      setSaving(false)
    }
  }

  async function unverify() {
    setVerified('')
    setVerifiedBy('')
    setNameInput('')
    setSaving(true)
    try {
      await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: '', verifiedBy: '' }),
      })
      onVerifiedChange(goal.id, '')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-white/10 py-4 px-2 last:border-b-0">
      <div className="flex items-center gap-3">
        <StatusDot status={goal.status} verified={verified} />

        {goal.number && (
          <span className="shrink-0 font-mono text-xs tracking-widest text-white/25">
            {goal.number}
          </span>
        )}

        <button
          onClick={() => onGoalClick(goal)}
          className="min-w-0 flex-1 text-left text-sm text-white/70 transition-colors hover:text-white/90"
        >
          {goal.text}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {goal.types.slice(0, 2).map((t) => (
            <span
              key={t}
              className="hidden rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/30 sm:inline"
            >
              {t}
            </span>
          ))}

          {verified === 'yes' ? (
            <button
              onClick={unverify}
              disabled={saving}
              title="Remove verification"
              className="flex h-7 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold tracking-widest uppercase text-black transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              ✓ VERIFIED
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verify()}
                placeholder="Your name"
                className="h-7 w-28 rounded-lg border border-white/10 bg-white/4 px-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/25"
              />
              <button
                onClick={verify}
                disabled={saving || !nameInput.trim()}
                title="Mark as verified"
                className="flex h-7 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-bold tracking-widest uppercase text-white/30 transition-colors hover:border-white/25 hover:text-white/60 disabled:opacity-40"
              >
                ✓ VERIFY
              </button>
            </div>
          )}
        </div>
      </div>

      {verified === 'yes' && verifiedBy && (
        <p className="mt-1 pl-8 text-[10px] tracking-[0.15em] uppercase text-white/30">
          Verified by {verifiedBy}
        </p>
      )}
    </div>
  )
}

export function TeacherDashboardClient({ categories: initial }: TeacherDashboardClientProps) {
  const [activeTrack, setActiveTrack] = useState('ALL')
  const [categories, setCategories] = useState(initial)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(initial.map((c) => c.key)))
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const allGoals = categories.flatMap((c) => c.goals)
  const totalGoals = allGoals.length
  const verifiedGoals = allGoals.filter((g) => g.verified === 'yes').length

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      goals:
        activeTrack === 'ALL'
          ? cat.goals
          : cat.goals.filter((g) => g.types.includes(activeTrack)),
    }))
    .filter((cat) => cat.goals.length > 0)

  const handleVerifiedChange = useCallback((goalId: string, verified: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        goals: cat.goals.map((g) => (g.id === goalId ? { ...g, verified } : g)),
      }))
    )
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth/teacher-logout', { method: 'POST' })
    router.push('/teacher')
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
            <span className="text-xs tracking-[0.2em] uppercase text-white/30">— TEACHER</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70"
            >
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

      {/* Stats */}
      <div className="px-6 mt-30" ref={heroRef}>
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-10 mb-10">
            <div>
              <p className="font-mono text-4xl font-black text-white sm:text-5xl" data-stat={totalGoals}>{totalGoals}</p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">TOTAL</p>
            </div>
            <div>
              <p className="font-mono text-4xl font-black text-white sm:text-5xl" data-stat={verifiedGoals}>{verifiedGoals}</p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">VERIFIED</p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase text-white/40">VERIFIED PROGRESS</span>
            <span className="font-mono text-xs text-white/40">
              {totalGoals > 0 ? Math.round((verifiedGoals / totalGoals) * 100) : 0}%
            </span>
          </div>
          <div className="h-px w-full overflow-hidden rounded-full mb-5 bg-white/10">
            <div
              className="h-full rounded-full bg-white/70 transition-all duration-700"
              style={{ width: `${totalGoals > 0 ? (verifiedGoals / totalGoals) * 100 : 0}%` }}
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
            const verifiedCount = cat.goals.filter((g) => g.verified === 'yes').length
            const total = cat.goals.length
            const pct = total > 0 ? (verifiedCount / total) * 100 : 0
            const numStr = String(cat.number).padStart(2, '0')
            const isExpanded = expandedCats.has(cat.key)

            return (
              <div
                key={cat.key}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md"
              >
                <GrainTexture id={`teacher-cat-${cat.number}`} />

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
                        {verifiedCount}/{total}
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
                      <TeacherGoalRow
                        key={goal.id}
                        goal={goal}
                        onVerifiedChange={handleVerifiedChange}
                        onGoalClick={setSelectedGoal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <GoalDrawer goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
    </>
  )
}
