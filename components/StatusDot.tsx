type GoalState = 'not-started' | 'in-progress' | 'done' | 'verified'

function goalState(status: string, verified: string): GoalState {
  if (verified === 'yes') return 'verified'
  if (status === 'done') return 'done'
  if (status === 'td') return 'in-progress'
  return 'not-started'
}

const stateLabel: Record<GoalState, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
  verified: 'Verified',
}

interface StatusDotProps {
  status: string
  verified: string
  size?: 'sm' | 'md'
}

// Empty ring → half-filled → solid → solid with an outer ring (the teacher's stamp).
export function StatusDot({ status, verified, size = 'sm' }: StatusDotProps) {
  const state = goalState(status, verified)
  const px = size === 'sm' ? 14 : 18

  const color = {
    'not-started': 'text-white/25',
    'in-progress': 'text-white/60',
    done: 'text-white/85',
    verified: 'text-white',
  }[state]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 16 16"
      role="img"
      aria-label={stateLabel[state]}
      className={`shrink-0 ${color}`}
    >
      <title>{stateLabel[state]}</title>
      {state === 'not-started' && (
        <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      )}
      {state === 'in-progress' && (
        <>
          <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3.5 A4.5 4.5 0 0 0 8 12.5 Z" fill="currentColor" />
        </>
      )}
      {state === 'done' && <circle cx="8" cy="8" r="5.25" fill="currentColor" />}
      {state === 'verified' && (
        <>
          <circle cx="8" cy="8" r="4" fill="currentColor" />
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
        </>
      )}
    </svg>
  )
}

interface StatusLabelProps {
  status: string
  verified: string
  verifiedBy: string
  /** Show "Not started" instead of rendering nothing. */
  showEmpty?: boolean
  className?: string
}

export function StatusLabel({ status, verified, verifiedBy, showEmpty = false, className = '' }: StatusLabelProps) {
  const state = goalState(status, verified)
  if (state === 'not-started' && !showEmpty) return null

  if (state === 'verified') {
    return (
      <span className={`text-xs text-white/50 ${className}`}>
        Verified{verifiedBy && <> by <span className="font-medium text-white/90">{verifiedBy}</span></>}
      </span>
    )
  }

  const tone = {
    'not-started': 'text-white/30',
    'in-progress': 'text-white/45',
    done: 'text-white/70',
  }[state]

  return <span className={`text-xs ${tone} ${className}`}>{stateLabel[state]}</span>
}
