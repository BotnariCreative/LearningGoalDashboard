'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { TiptapEditor } from './TiptapEditor'
import type { Goal } from '@/types'

interface GoalEditorClientProps {
  goal: Goal
}

const STATUS_OPTIONS = [
  { value: '', label: 'Not Started' },
  { value: 'td', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const

export function GoalEditorClient({ goal }: GoalEditorClientProps) {
  const [status, setStatus] = useState<'' | 'td' | 'done'>(goal.status)
  const [project, setProject] = useState(goal.project)
  const [documentation, setDocumentation] = useState(goal.documentation)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([headerRef.current, contentRef.current], {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
      })
    })
    return () => ctx.revert()
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          verified: goal.verified,
          project,
          bewijs: goal.bewijs,
          documentation,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh px-4 pb-20 pt-8">
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-40 px-4">
        <nav className="mx-auto mt-4 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/70"
            >
              ← BACK
            </button>
            {goal.number && (
              <span className="font-mono text-xs tracking-widest text-white/30">{goal.number}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">
                ✓ SAVED
              </span>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-white px-5 py-1.5 text-xs font-bold tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'SAVING…' : 'SAVE'}
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-4xl pt-28">
        {/* Goal header */}
        <div ref={headerRef} className="mb-8">
          <p className="mb-2 text-xs tracking-[0.35em] uppercase text-white/40">
            {goal.categoryName}
          </p>
          <h1 className="mb-3 text-xl font-black leading-snug tracking-tight text-white sm:text-2xl">
            {goal.text}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {goal.types.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/40"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div ref={contentRef} className="space-y-6">
          {/* Metadata fields */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as '' | 'td' | 'done')}
                  className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition-all focus:border-white/25 focus:bg-white/[0.07]"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#111]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
                  Project
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Project name or URL"
                  className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.07]"
                />
              </div>
            </div>
          </div>

          {/* Documentation editor */}
          <div>
            <h2 className="mb-3 text-xs font-bold tracking-[0.2em] uppercase text-white/50">
              Documentation
            </h2>
            <TiptapEditor content={documentation} onChange={setDocumentation} />
          </div>

          {/* Save button (bottom) */}
          <div className="flex justify-end pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-white px-8 py-3.5 text-sm font-bold tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
