'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { GrainTexture } from '@/components/GrainTexture'

export default function TeacherLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 32,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
    }, cardRef)
    return () => ctx.revert()
  }, [])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/teacher/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid password')
        gsap.fromTo(
          cardRef.current,
          { x: -8 },
          { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        )
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div ref={cardRef} className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-8 backdrop-blur-md">
        <GrainTexture id="teacher-login" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <span className="ml-2 text-xs tracking-[0.35em] uppercase text-white/40">TEACHER</span>
          </div>

          <h1 className="mb-1 text-2xl font-black tracking-tight text-white">
            Enter password
          </h1>
          <p className="mb-8 text-sm text-white/40">
            Log in as a teacher to verify learning goals.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold tracking-[0.15em] uppercase text-white/40">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.07]"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-white/60" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white py-3.5 text-sm font-bold tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? 'VERIFYING…' : 'ENTER'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-bold tracking-[0.15em] uppercase text-white/25 transition-colors hover:text-white/50"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
