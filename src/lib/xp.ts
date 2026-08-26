export interface LevelInfo {
  level: number
  title: string
  xpIntoLevel: number
  xpForLevel: number
  totalXp: number
  progress: number
}

const TITLES = [
  'Anfänger',
  'Lernender',
  'Fokussierter',
  'Konzentrations-Profi',
  'Fokus-Krieger',
  'Deep-Work-Talent',
  'Fokus-Meister',
  'Produktivitäts-Ass',
  'Flow-Experte',
  'Focus Master 🔥'
]

// XP required to go from level n to n+1 grows quadratically for a natural slow-down curve.
export function xpForLevel(level: number): number {
  return Math.round(80 * Math.pow(level, 1.45) + 40)
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1
  let remaining = totalXp
  let need = xpForLevel(level)
  while (remaining >= need) {
    remaining -= need
    level += 1
    need = xpForLevel(level)
  }
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)]
  return {
    level,
    title: level > TITLES.length ? `${title} Lv.${level}` : title,
    xpIntoLevel: remaining,
    xpForLevel: need,
    totalXp,
    progress: remaining / need
  }
}

export const XP_RULES = {
  perFocusMinute: 1,
  sessionCompleted: 10,
  dailyGoalReached: 50
}
