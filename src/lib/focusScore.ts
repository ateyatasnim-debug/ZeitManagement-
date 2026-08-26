import type { FocusSession } from '../types'

/**
 * Composite score 0-100. Weighted: completion (40), low pause count (15),
 * few distractions (25), duration match vs. plan (20).
 */
export function computeFocusScore(session: Omit<FocusSession, 'id' | 'focusScore'>): number {
  const plannedSeconds = session.plannedMinutes * 60
  const durationRatio = plannedSeconds > 0 ? Math.min(session.actualSeconds / plannedSeconds, 1) : 1

  const completionScore = session.completed ? 40 : 40 * durationRatio
  const pausePenalty = Math.min(session.pauseCount * 3, 15)
  const pauseScore = 15 - pausePenalty
  const distractionPenalty = Math.min(session.distractions.length * 6, 25)
  const distractionScore = 25 - distractionPenalty
  const durationScore = 20 * durationRatio

  const total = completionScore + pauseScore + distractionScore + durationScore
  return Math.max(0, Math.min(100, Math.round(total)))
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Exzellent', color: 'text-emerald-400' }
  if (score >= 70) return { label: 'Gut', color: 'text-lime-400' }
  if (score >= 50) return { label: 'Okay', color: 'text-amber-400' }
  return { label: 'Ausbaufähig', color: 'text-rose-400' }
}
