import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { distractionBreakdown } from '../../lib/stats'
import { DISTRACTION_LABELS, type DistractionReason } from '../../types'

export function DistractionSummaryCard() {
  const sessions = useStore((s) => s.sessions)
  const breakdown = useMemo(() => distractionBreakdown(sessions), [sessions])
  const total = breakdown.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        📱 Ablenkungs-Tracker
      </div>
      {breakdown.length === 0 ? (
        <p className="text-sm text-slate-500">
          Noch keine Ablenkungen erfasst. Nutze während einer Session „Ich wurde abgelenkt“, um mehr über deine
          Muster zu erfahren.
        </p>
      ) : (
        <>
          <div className="text-sm text-slate-400 mb-3">
            Deine häufigste Ablenkung:{' '}
            <span className="text-slate-100 font-semibold">
              {DISTRACTION_LABELS[breakdown[0].reason as DistractionReason].icon}{' '}
              {DISTRACTION_LABELS[breakdown[0].reason as DistractionReason].label}
            </span>
          </div>
          <div className="space-y-2">
            {breakdown.map((b) => {
              const info = DISTRACTION_LABELS[b.reason as DistractionReason]
              const pct = total > 0 ? (b.count / total) * 100 : 0
              return (
                <div key={b.reason} className="flex items-center gap-2">
                  <span className="w-6 text-center">{info.icon}</span>
                  <span className="text-xs text-slate-400 w-28 shrink-0">{info.label}</span>
                  <div className="flex-1 progress-track h-2">
                    <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{b.count}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
