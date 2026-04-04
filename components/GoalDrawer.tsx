'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { StatusDot } from './StatusDot'
import type { Goal } from '@/types'

interface GoalDrawerProps {
  goal: Goal | null
  onClose: () => void
}

export function GoalDrawer({ goal, onClose }: GoalDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [sanitizedDoc, setSanitizedDoc] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!goal?.documentation) {
      setSanitizedDoc('')
      return
    }
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitizedDoc(DOMPurify.sanitize(goal.documentation))
    })
  }, [goal?.documentation])

  useEffect(() => {
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel || !overlay) return

    if (goal) {
      // Open
      gsap.set(panel, { x: '100%' })
      gsap.set(overlay, { opacity: 0 })
      gsap.to(panel, { x: 0, duration: 0.38, ease: 'power3.out' })
      gsap.to(overlay, { opacity: 1, duration: 0.3 })
    } else {
      // Close
      gsap.to(panel, { x: '100%', duration: 0.3, ease: 'power3.in' })
      gsap.to(overlay, { opacity: 0, duration: 0.25 })
    }
  }, [goal])

  // Handle key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxSrc) setLightboxSrc(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, lightboxSrc])

  const statusLabel =
    goal?.verified === 'yes'
      ? 'Verified'
      : goal?.status === 'done'
        ? 'Done'
        : goal?.status === 'td'
          ? 'In Progress'
          : 'Not Started'

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 opacity-0"
        style={{ pointerEvents: goal ? 'auto' : 'none' }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl translate-x-full flex-col border-l border-white/10 bg-background/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div className="flex-1 pr-4">
            <p className="mb-2 text-xs tracking-[0.35em] uppercase text-white/40">
              {goal?.categoryName}
            </p>
            {goal?.number && (
              <p className="mb-1 font-mono text-xs tracking-widest text-white/30">{goal.number}</p>
            )}
            <h2 className="text-base font-bold leading-snug text-white/90">{goal?.text}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-xs font-bold tracking-[0.15em] uppercase text-white/30 transition-colors hover:text-white/70"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-4 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <StatusDot status={goal?.status ?? ''} verified={goal?.verified ?? ''} size="md" />
            <div>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">
                {statusLabel}
              </span>
              {goal?.verified === 'yes' && goal.verifiedBy && (
                <p className="text-[10px] tracking-widest text-white/30">by {goal.verifiedBy}</p>
              )}
            </div>
          </div>
          {goal?.types && goal.types.length > 0 && (
            <div className="flex gap-1.5">
              {goal.types.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/40"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {(goal?.project || goal?.bewijs) && (
            <div className="mb-6 space-y-4">
              {goal.project && (
                <div>
                  <p className="mb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    Project
                  </p>
                  <p className="text-sm text-white/70">{goal.project}</p>
                </div>
              )}
              {goal.bewijs && (
                <div>
                  <p className="mb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    Evidence
                  </p>
                  <p className="text-sm text-white/70">{goal.bewijs}</p>
                </div>
              )}
            </div>
          )}

          {goal?.documentation ? (
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                Documentation
              </p>
              {sanitizedDoc && (
                <div
                  className="doc-content"
                  dangerouslySetInnerHTML={{ __html: sanitizedDoc }}
                  onClick={(e) => {
                    const t = e.target as HTMLElement
                    if (t.tagName === 'IMG') setLightboxSrc((t as HTMLImageElement).src)
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-white/20">No documentation yet.</p>
            </div>
          )}
        </div>

        {goal?.updatedAt && (
          <div className="border-t border-white/10 px-6 py-3">
            <p className="text-xs text-white/20">
              Updated {new Date(goal.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-5 top-5 text-xs font-bold tracking-[0.15em] uppercase text-white/40 transition-colors hover:text-white/80"
          >
            ✕ CLOSE
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
