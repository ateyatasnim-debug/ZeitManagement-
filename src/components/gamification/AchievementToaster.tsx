import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { ACHIEVEMENTS } from '../../lib/achievements'

export function AchievementToaster() {
  const toasts = useStore((s) => s.pendingToasts)
  const dismissToast = useStore((s) => s.dismissToast)

  useEffect(() => {
    if (toasts.length === 0) return
    const id = toasts[0].id
    const t = setTimeout(() => dismissToast(id), 5000)
    return () => clearTimeout(t)
  }, [toasts, dismissToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.slice(0, 3).map((t) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === t.payload)
        if (!achievement) return null
        return (
          <div
            key={t.id}
            className="pointer-events-auto animate-toast-in card px-4 py-3 flex items-center gap-3 border-accent/30 shadow-accent/20"
          >
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <div className="text-xs uppercase tracking-wide text-accent font-bold">Achievement freigeschaltet</div>
              <div className="text-sm font-semibold">{achievement.title}</div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-2 text-slate-500 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
