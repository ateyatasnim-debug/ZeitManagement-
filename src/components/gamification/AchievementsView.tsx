import { useMemo } from 'react'
import { useStore, totalXp } from '../../store/useStore'
import { ACHIEVEMENTS } from '../../lib/achievements'
import { levelFromXp } from '../../lib/xp'
import { XPBar } from './XPBar'

export function AchievementsView() {
  const unlocked = useStore((s) => s.unlockedAchievements)
  const xpEvents = useStore((s) => s.xpEvents)
  const level = useMemo(() => levelFromXp(totalXp(xpEvents)), [xpEvents])
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u.unlockedAt]))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">🏆 Erfolge & Level</h1>
      <XPBar />

      <div className="card p-4 text-sm text-slate-400">
        Aktueller Level: <span className="text-slate-200 font-semibold">{level.level}</span> · Insgesamt{' '}
        <span className="text-slate-200 font-semibold">{totalXp(xpEvents)} XP</span> gesammelt · Insgesamt{' '}
        <span className="text-slate-200 font-semibold">{unlocked.length}</span> / {ACHIEVEMENTS.length} Erfolge
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedMap.has(a.id)
          return (
            <div
              key={a.id}
              className={`card p-4 flex items-start gap-3 ${isUnlocked ? '' : 'opacity-45 grayscale'}`}
            >
              <span className="text-3xl leading-none">{a.icon}</span>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{a.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{a.description}</div>
                {isUnlocked && (
                  <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                    Freigeschaltet am {new Date(unlockedMap.get(a.id)!).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
