'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('light')
    document.documentElement.classList.toggle('light', next)
    localStorage.setItem('theme', next ? 'light' : 'dark')
    setIsLight(next)
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        onClick={toggle}
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        className="relative flex items-center rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur-sm"
      >
        {/* Sliding thumb */}
        <span
          className={`
            absolute left-1 h-7 w-7 rounded-full bg-white/20
            motion-safe:transition-transform motion-safe:duration-[250ms] motion-safe:ease-out
            ${isLight ? 'translate-x-0' : 'translate-x-7'}
          `}
        />

        {/* Sun — left */}
        <span
          className={`relative z-10 flex h-7 w-7 items-center justify-center motion-safe:transition-colors motion-safe:duration-200 ${
            isLight ? 'text-white/90' : 'text-white/40'
          }`}
        >
          <Sun size={13} strokeWidth={2} />
        </span>

        {/* Moon — right */}
        <span
          className={`relative z-10 flex h-7 w-7 items-center justify-center motion-safe:transition-colors motion-safe:duration-200 ${
            isLight ? 'text-white/40' : 'text-white/90'
          }`}
        >
          <Moon size={13} strokeWidth={2} />
        </span>
      </button>
    </div>
  )
}
