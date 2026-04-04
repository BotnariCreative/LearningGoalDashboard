interface StatusDotProps {
  status: string
  verified: string
  size?: 'sm' | 'md'
}

export function StatusDot({ status, verified, size = 'sm' }: StatusDotProps) {
  const sizeClass = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'

  if (verified === 'yes') {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${sizeClass} rounded-full bg-white`}
        title="Verified"
      />
    )
  }
  if (status === 'done') {
    return (
      <span
        className={`inline-block shrink-0 ${sizeClass} rounded-full bg-white/85`}
        title="Done"
      />
    )
  }
  if (status === 'td') {
    return (
      <span
        className={`inline-block shrink-0 ${sizeClass} rounded-full bg-white/50`}
        title="In Progress"
      />
    )
  }
  return (
    <span
      className={`inline-block shrink-0 ${sizeClass} rounded-full bg-white/20`}
      title="Not Started"
    />
  )
}
