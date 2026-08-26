import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { ProgressBar } from '../ui/ProgressBar'
import { formatMinutes, toDateKey } from '../../lib/format'

export function DailyGoalCard() {
  const sessions = useStore((s) => s.sessions)
  const goalMinutes = useStore((s) => s.settings.dailyGoalMinutes)
  const updateSettings = useStore((s) => s.updateSettings)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goalMinutes)

  const todayMinutes = useMemo(() => {
    const today = toDateKey(new Date())
    return sessions
      .filter((s) => s.type === 'focus' && s.completed && toDateKey(s.startedAt) === today)
      .reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  }, [sessions])

  const progress = goalMinutes > 0 ? todayMinutes / goalMinutes : 0
  const reached = progress >= 1

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <span>🎯</span> Tagesziel
        </div>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(Number(e.target.value))}
              className="w-16 bg-base-700 rounded-lg px-2 py-1 text-xs text-right outline-none"
            />
            <span className="text-xs text-slate-400">min</span>
            <button
              className="text-xs text-accent font-semibold ml-1"
              onClick={() => {
                updateSettings({ dailyGoalMinutes: Math.max(5, draft) })
                setEditing(false)
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <button className="text-xs text-slate-400 hover:text-accent" onClick={() => setEditing(true)}>
            Ziel: {formatMinutes(goalMinutes)} · Bearbeiten
          </button>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-extrabold tabular-nums">{formatMinutes(todayMinutes)}</span>
        <span className="text-sm text-slate-500">/ {formatMinutes(goalMinutes)}</span>
        {reached && <span className="ml-auto text-lg">✅</span>}
      </div>
      <ProgressBar value={progress} />
    </div>
  )
}
