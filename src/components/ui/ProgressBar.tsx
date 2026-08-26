interface Props {
  value: number // 0-1
  className?: string
}

export function ProgressBar({ value, className }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={`progress-track ${className ?? ''}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
