'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { StatusDot } from './StatusDot'
import type { Goal } from '@/types'

interface GoalRowProps {
  goal: Goal
  onClick: (goal: Goal) => void
}

export function GoalRow({ goal, onClick }: GoalRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bracketsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    const content = contentRef.current
    const brackets = bracketsRef.current
    if (!row || !content || !brackets) return

    const onEnter = () => {
      gsap.to(content, { x: 12, duration: 0.24, ease: 'power2.out' })
      gsap.to(brackets, { opacity: 1, duration: 0.18 })
    }
    const onLeave = () => {
      gsap.to(content, { x: 0, duration: 0.28, ease: 'power2.out' })
      gsap.to(brackets, { opacity: 0, duration: 0.22 })
    }

    row.addEventListener('mouseenter', onEnter)
    row.addEventListener('mouseleave', onLeave)
    return () => {
      row.removeEventListener('mouseenter', onEnter)
      row.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={rowRef}
      onClick={() => onClick(goal)}
      className="group relative cursor-pointer border-b border-white/10 py-5 transition-colors hover:border-white/25"
    >
      {/* Corner brackets - visible on hover */}
      <div ref={bracketsRef} className="pointer-events-none absolute inset-0 opacity-0">
        <span className="absolute left-1.5 top-1.5 h-2 w-2 border-[1.5px] border-b-0 border-r-0 border-white/40" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 border-[1.5px] border-b-0 border-l-0 border-white/40" />
        <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-[1.5px] border-r-0 border-t-0 border-white/40" />
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-[1.5px] border-l-0 border-t-0 border-white/40" />
      </div>

      <div ref={contentRef} className="flex items-center gap-3 px-2">
        <StatusDot status={goal.status} verified={goal.verified} />

        {goal.number && (
          <span className="shrink-0 font-mono text-xs tracking-widest text-white/30">
            {goal.number}
          </span>
        )}

        <span className="min-w-0 flex-1 text-sm leading-relaxed text-white/75">
          <span className="line-clamp-2">{goal.text}</span>
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {goal.types.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/40"
            >
              {t}
            </span>
          ))}
          <span className="ml-1 text-white/25 transition-colors group-hover:text-white/60">→</span>
        </div>
      </div>
    </div>
  )
}
