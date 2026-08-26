import { useMemo } from 'react'
import { useStore, totalXp } from '../../store/useStore'
import { levelFromXp } from '../../lib/xp'
import { ProgressBar } from '../ui/ProgressBar'
import { activeStreak } from '../../lib/achievements'

export function XPBar() {
  const xpEvents = useStore((s) => s.xpEvents)
  const streakDates = useStore((s) => s.streakDates)
  const level = useMemo(() => levelFromXp(totalXp(xpEvents)), [xpEvents])
  const streak = useMemo(() => activeStreak(streakDates), [streakDates])

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-bold">
          Level {level.level} <span className="text-slate-400 font-medium">– {level.title}</span>
        </div>
        {streak > 0 && (
          <div className="text-xs font-semibold text-orange-400 flex items-center gap-1">🔥 {streak} Tage</div>
        )}
      </div>
      <ProgressBar value={level.progress} />
      <div className="text-xs text-slate-500 mt-1 tabular-nums">
        {level.xpIntoLevel} / {level.xpForLevel} XP
      </div>
    </div>
  )
}
