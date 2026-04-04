'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CategorySection } from './CategorySection'
import { GoalDrawer } from './GoalDrawer'
import type { Goal, CategoryWithGoals } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const TRACKS = ['ALL', 'APP', 'AI', 'CCS', 'DI']

interface DashboardClientProps {
  categories: CategoryWithGoals[]
}

export function DashboardClient({ categories }: DashboardClientProps) {
  const [activeTrack, setActiveTrack] = useState('ALL')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const allGoals = categories.flatMap((c) => c.goals)
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter(
    (g) => g.status === 'done' || g.verified === 'yes'
  ).length
  const verifiedGoals = allGoals.filter((g) => g.verified === 'yes').length
  const overallPct = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  // Filter categories by track
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      goals:
        activeTrack === 'ALL'
          ? cat.goals
          : cat.goals.filter((g) => g.types.includes(activeTrack)),
    }))
    .filter((cat) => cat.goals.length > 0)

  // Animate hero stats on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      const statEls = document.querySelectorAll('[data-stat]')
      statEls.forEach((el) => {
        const target = parseInt(el.getAttribute('data-stat') || '0')
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 1.6,
            ease: 'power2.out',
            snap: { innerText: 1 },
            delay: 0.4,
          }
        )
      })

      gsap.from(heroRef.current, {
        y: 24,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-40 px-4">
        <nav className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.35em] uppercase text-white/70">
              LEARNING GOALS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/teacher"
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70"
            >
              TEACHER →
            </Link>
            <Link
              href="/admin"
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70"
            >
              ADMIN →
            </Link>
          </div>
        </nav>
      </header>
      {/* Stats row + progress */}
      <div className="px-6 mt-30" ref={heroRef}>
        <div className="mx-auto max-w-5xl">
          <div className='flex gap-10 mb-10'>
            <div>
              <p
                className="font-mono text-4xl font-black text-white sm:text-5xl"
                data-stat={totalGoals}
              >
                {totalGoals}
              </p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">TOTAL</p>
            </div>
            <div>
              <p
                className="font-mono text-4xl font-black text-white sm:text-5xl"
                data-stat={completedGoals}
              >
                {completedGoals}
              </p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">COMPLETED</p>
            </div>
            <div>
              <p
                className="font-mono text-4xl font-black text-white sm:text-5xl"
                data-stat={verifiedGoals}
              >
                {verifiedGoals}
              </p>
              <p className="mt-1 text-xs tracking-[0.28em] uppercase text-white/40">VERIFIED</p>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase text-white/40">
              OVERALL PROGRESS
            </span>
            <span className="font-mono text-xs text-white/40">
              {Math.round(overallPct)}%
            </span>
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
          {filteredCategories.map((cat) => (
            <CategorySection
              key={cat.key}
              category={cat}
              onGoalClick={setSelectedGoal}
            />
          ))}
        </div>
      </main>

      {/* Goal Drawer */}
      <GoalDrawer goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
    </>
  )
}
