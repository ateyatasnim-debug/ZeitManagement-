import type { AppState, Achievement, FocusSession } from '../types'
import { toDateKey } from './format'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session', title: 'Erste Fokus-Session', description: 'Schließe deine erste Fokus-Session ab.', icon: '🥉' },
  { id: 'streak_3', title: '3 Tage in Folge', description: 'Erreiche 3 Tage in Folge dein Mindest-Fokusziel.', icon: '🔥' },
  { id: 'streak_7', title: '7 Tage Fokus-Streak', description: 'Erreiche 7 Tage in Folge dein Mindest-Fokusziel.', icon: '🔥' },
  { id: 'streak_30', title: '30 Tage Streak', description: 'Ein ganzer Monat ohne Unterbrechung.', icon: '🏅' },
  { id: 'focus_10h', title: '10 Stunden Fokus', description: 'Sammle insgesamt 10 Stunden Fokuszeit.', icon: '🧠' },
  { id: 'focus_50h', title: '50 Stunden Fokus', description: 'Sammle insgesamt 50 Stunden Fokuszeit.', icon: '🧠' },
  { id: 'focus_100h', title: '100 Stunden Fokus', description: 'Sammle insgesamt 100 Stunden Fokuszeit.', icon: '🧠' },
  { id: 'sessions_100', title: '100 Sessions', description: 'Schließe 100 Fokus-Sessions ab.', icon: '💪' },
  { id: 'night_owl', title: 'Nachteule', description: '5 Sessions nach 20 Uhr.', icon: '🌙' },
  { id: 'big_day', title: 'Marathon-Tag', description: '4 Stunden Fokus an einem einzigen Tag.', icon: '🚀' },
  { id: 'no_distraction', title: 'Eiserner Fokus', description: 'Schließe eine 50-Minuten-Session ohne Ablenkung ab.', icon: '🛡️' },
  { id: 'early_bird', title: 'Früher Vogel', description: '5 Sessions vor 8 Uhr morgens.', icon: '🌅' },
  { id: 'projects_5', title: 'Projekt-Manager', description: 'Lege 5 Projekte an.', icon: '📚' },
  { id: 'perfect_score', title: 'Perfekter Fokus', description: 'Erreiche einen Fokus-Score von 100.', icon: '💯' }
]

export function evaluateAchievements(state: AppState): string[] {
  const completed = state.sessions.filter((s) => s.type === 'focus' && s.completed)
  const unlockedIds = new Set(state.unlockedAchievements.map((a) => a.id))
  const newly: string[] = []

  const unlock = (id: string, condition: boolean) => {
    if (condition && !unlockedIds.has(id)) newly.push(id)
  }

  const totalFocusMinutes = completed.reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  const totalFocusHours = totalFocusMinutes / 60

  unlock('first_session', completed.length >= 1)
  unlock('sessions_100', completed.length >= 100)
  unlock('focus_10h', totalFocusHours >= 10)
  unlock('focus_50h', totalFocusHours >= 50)
  unlock('focus_100h', totalFocusHours >= 100)
  unlock('streak_3', longestCurrentStreak(state.streakDates) >= 3)
  unlock('streak_7', longestCurrentStreak(state.streakDates) >= 7)
  unlock('streak_30', longestCurrentStreak(state.streakDates) >= 30)
  unlock('projects_5', state.projects.length >= 5)

  const nightSessions = completed.filter((s) => new Date(s.startedAt).getHours() >= 20)
  unlock('night_owl', nightSessions.length >= 5)

  const earlySessions = completed.filter((s) => new Date(s.startedAt).getHours() < 8)
  unlock('early_bird', earlySessions.length >= 5)

  const byDay = new Map<string, number>()
  for (const s of completed) {
    const key = toDateKey(s.startedAt)
    byDay.set(key, (byDay.get(key) || 0) + s.actualSeconds / 60)
  }
  const maxDayMinutes = Math.max(0, ...byDay.values())
  unlock('big_day', maxDayMinutes >= 240)

  unlock(
    'no_distraction',
    completed.some((s: FocusSession) => s.plannedMinutes >= 50 && s.distractions.length === 0)
  )

  unlock('perfect_score', completed.some((s) => (s.focusScore ?? 0) >= 100))

  return newly
}

export function longestCurrentStreak(streakDates: string[]): number {
  if (streakDates.length === 0) return 0
  const sorted = [...new Set(streakDates)].sort()
  let streak = 1
  let best = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const cur = new Date(sorted[i] + 'T00:00:00')
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      streak += 1
    } else {
      streak = 1
    }
    best = Math.max(best, streak)
  }
  return best
}

/** Streak ending today or yesterday (still "alive"). */
export function activeStreak(streakDates: string[]): number {
  if (streakDates.length === 0) return 0
  const sorted = [...new Set(streakDates)].sort()
  const last = sorted[sorted.length - 1]
  const today = toDateKey(new Date())
  const yesterday = toDateKey(new Date(Date.now() - 86400000))
  if (last !== today && last !== yesterday) return 0

  let streak = 1
  for (let i = sorted.length - 1; i > 0; i--) {
    const cur = new Date(sorted[i] + 'T00:00:00')
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) streak += 1
    else break
  }
  return streak
}
