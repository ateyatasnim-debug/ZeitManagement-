import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { computeDailyInsight } from '../../lib/insights'
import { formatMinutes } from '../../lib/format'

export function DailyInsightCard() {
  const state = useStore((s) => s)
  const insight = useMemo(() => computeDailyInsight(state), [state.sessions])

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
        <span>💡</span> Dein Tag
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <Stat label="Fokuszeit" value={formatMinutes(insight.focusMinutesToday)} />
        <Stat label="Sessions" value={String(insight.sessionsToday)} />
        <Stat label="Ø Länge" value={formatMinutes(insight.avgSessionMinutes)} />
      </div>
      <p className="text-sm text-slate-400">{insight.recommendation}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-800 rounded-xl py-2">
      <div className="text-base font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}
