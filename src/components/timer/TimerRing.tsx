import { formatSeconds } from '../../lib/format'

interface Props {
  remainingSeconds: number
  totalSeconds: number
  label: string
  size?: number
}

export function TimerRing({ remainingSeconds, totalSeconds, label, size = 280 }: Props) {
  const radius = size / 2 - 14
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, 1 - remainingSeconds / totalSeconds)) : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2b47" strokeWidth={14} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f97316" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold tabular-nums tracking-tight">
          {formatSeconds(Math.max(0, remainingSeconds))}
        </span>
        <span className="text-sm text-slate-400 mt-2 uppercase tracking-wide font-medium">{label}</span>
      </div>
    </div>
  )
}
