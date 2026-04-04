'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GrainTexture } from './GrainTexture'
import { GoalRow } from './GoalRow'
import type { Goal, CategoryWithGoals } from '@/types'

gsap.registerPlugin(ScrollTrigger)

interface CategorySectionProps {
  category: CategoryWithGoals
  onGoalClick: (goal: Goal) => void
}

export function CategorySection({ category, onGoalClick }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const doneCount = category.goals.filter(
    (g) => g.status === 'done' || g.verified === 'yes'
  ).length
  const total = category.goals.length
  const progressPct = total > 0 ? (doneCount / total) * 100 : 0

  // Scroll animation for section entry
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return
      gsap.from(sectionRef.current, {
        y: 24,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Animate list items when expanded
  useEffect(() => {
    if (!expanded || !listRef.current) return
    const items = listRef.current.querySelectorAll('[data-goal-row]')
    if (items.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.04,
        }
      )
    }, listRef)

    return () => ctx.revert()
  }, [expanded])

  const numStr = String(category.number).padStart(2, '0')

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md"
    >
      <GrainTexture id={`cat-${category.number}`} />

      {/* Category header */}
      <div className="relative z-10 flex items-center gap-4 px-6 py-5">
        <span className="font-mono text-4xl font-black tracking-tight text-white/10 select-none">
          {numStr}.
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-black tracking-tight text-white/90">{category.name}</h2>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-px flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/60 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-white/30">
              {doneCount}/{total}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-xs font-bold tracking-[0.15em] uppercase text-white/30 transition-colors hover:text-white/70"
        >
          {expanded ? '↑ HIDE' : '↓ SHOW'}
        </button>
      </div>

      {/* Goals list */}
      {expanded && (
        <div ref={listRef} className="relative z-10 px-4 pb-2">
          {category.goals.map((goal) => (
            <div key={goal.id} data-goal-row>
              <GoalRow goal={goal} onClick={onGoalClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
