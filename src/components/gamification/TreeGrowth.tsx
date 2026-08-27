import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { stageForMinutes, nextStageAt } from '../../lib/growth'
import { toDateKey } from '../../lib/format'

export function TreeGrowth() {
  const sessions = useStore((s) => s.sessions)

  const todayMinutes = useMemo(() => {
    const today = toDateKey(new Date())
    return sessions
      .filter((s) => s.type === 'focus' && toDateKey(s.startedAt) === today)
      .reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  }, [sessions])

  const stage = stageForMinutes(todayMinutes)
  const next = nextStageAt(todayMinutes)

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="text-5xl leading-none">{stage.emoji}</div>
      <div>
        <div className="text-sm font-semibold text-slate-200">{stage.label}</div>
        <div className="text-xs text-slate-500">
          {next !== null
            ? `Noch ${Math.round(next - todayMinutes)} Min. bis zur nächsten Stufe`
            : 'Maximale Stufe für heute erreicht 🌳✨'}
        </div>
      </div>
    </div>
  )
}
