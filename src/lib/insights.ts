import type { AppState, EnergyLevel, FocusSession } from '../types'
import { toDateKey, formatMinutes, formatHour } from './format'

export interface AdaptiveSuggestion {
  suggestedFocusMinutes: number
  suggestedBreakMinutes: number
  reason: string
}

/**
 * Heuristic (not ML): looks at completed vs. abandoned sessions per planned
 * length and at how long focus sessions typically run before the user stops
 * pausing/aborting, to propose a better default length.
 */
export function computeAdaptiveSuggestion(state: AppState): AdaptiveSuggestion | null {
  const focusSessions = state.sessions.filter((s) => s.type === 'focus')
  if (focusSessions.length < 8) return null

  const currentPreset =
    state.settings.customPresets.find((p) => p.id === state.settings.activePresetId) ??
    state.settings.customPresets[0]
  if (!currentPreset) return null

  const abandonRate = ratioAbandoned(focusSessions.filter((s) => s.plannedMinutes === currentPreset.focusMinutes))
  const avgActualMinutes = average(focusSessions.map((s) => s.actualSeconds / 60))

  if (abandonRate < 0.15) return null // current preset works fine, no nag
  if (avgActualMinutes < currentPreset.focusMinutes * 1.05) return null

  const suggested = roundToFive(avgActualMinutes)
  if (Math.abs(suggested - currentPreset.focusMinutes) < 10) return null

  const suggestedBreak = suggested >= 45 ? 10 : suggested >= 30 ? 7 : 5

  return {
    suggestedFocusMinutes: suggested,
    suggestedBreakMinutes: suggestedBreak,
    reason: `Du arbeitest im Schnitt ${formatMinutes(avgActualMinutes)} am Stück und brichst ${currentPreset.focusMinutes}-Minuten-Sessions selten ab. Mit längeren Blöcken könntest du besser in den Flow kommen.`
  }
}

function ratioAbandoned(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0
  const abandoned = sessions.filter((s) => !s.completed).length
  return abandoned / sessions.length
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function roundToFive(n: number): number {
  return Math.round(n / 5) * 5
}

export interface HourBucket {
  hour: number
  minutes: number
}

export function focusByHour(sessions: FocusSession[]): HourBucket[] {
  const buckets: number[] = new Array(24).fill(0)
  for (const s of sessions) {
    if (s.type !== 'focus') continue
    const hour = new Date(s.startedAt).getHours()
    buckets[hour] += s.actualSeconds / 60
  }
  return buckets.map((minutes, hour) => ({ hour, minutes }))
}

export function bestProductiveWindow(sessions: FocusSession[]): string | null {
  const buckets = focusByHour(sessions)
  const totalMinutes = buckets.reduce((a, b) => a + b.minutes, 0)
  if (totalMinutes < 60) return null

  let bestStart = 0
  let bestSum = -1
  for (let h = 0; h < 24; h++) {
    const sum = buckets[h].minutes + buckets[(h + 1) % 24].minutes
    if (sum > bestSum) {
      bestSum = sum
      bestStart = h
    }
  }
  if (bestSum <= 0) return null
  return `${formatHour(bestStart)}–${formatHour((bestStart + 2) % 24)}`
}

export interface DailyInsight {
  focusMinutesToday: number
  sessionsToday: number
  avgSessionMinutes: number
  bestWindow: string | null
  recommendation: string
}

export function computeDailyInsight(state: AppState): DailyInsight {
  const today = toDateKey(new Date())
  const todaysSessions = state.sessions.filter(
    (s) => s.type === 'focus' && toDateKey(s.startedAt) === today
  )
  const focusMinutesToday = todaysSessions.reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  const sessionsToday = todaysSessions.length
  const avgSessionMinutes = sessionsToday > 0 ? focusMinutesToday / sessionsToday : 0

  const allFocusSessions = state.sessions.filter((s) => s.type === 'focus')
  const bestWindow = bestProductiveWindow(allFocusSessions)

  let recommendation: string
  if (sessionsToday === 0) {
    recommendation = 'Noch keine Session heute – starte mit einer kurzen Fokuszeit, um den Tag in Schwung zu bringen.'
  } else if (bestWindow) {
    recommendation = `Du warst historisch zwischen ${bestWindow} Uhr am produktivsten. Plane deine anspruchsvollste Aufgabe für dieses Zeitfenster.`
  } else {
    recommendation = 'Sammle noch ein paar Sessions – danach kann ich dir dein produktivstes Zeitfenster zeigen.'
  }

  return { focusMinutesToday, sessionsToday, avgSessionMinutes, bestWindow, recommendation }
}

export interface StudyPlanBlock {
  index: number
  type: 'focus' | 'break'
  startMinuteOffset: number
  durationMinutes: number
}

/** Rule-based schedule generator (no external AI) that splits a study goal into focus/break blocks. */
export function generateStudyPlan(
  totalMinutes: number,
  focusMinutes: number,
  breakMinutes: number,
  longBreakMinutes: number,
  sessionsUntilLongBreak: number
): StudyPlanBlock[] {
  const blocks: StudyPlanBlock[] = []
  let remaining = totalMinutes
  let offset = 0
  let index = 0
  let sinceLongBreak = 0

  while (remaining > 0) {
    const thisFocus = Math.min(focusMinutes, remaining)
    blocks.push({ index: index++, type: 'focus', startMinuteOffset: offset, durationMinutes: thisFocus })
    offset += thisFocus
    remaining -= thisFocus
    sinceLongBreak += 1

    if (remaining <= 0) break

    const isLong = sinceLongBreak >= sessionsUntilLongBreak
    const brk = isLong ? longBreakMinutes : breakMinutes
    blocks.push({ index: index++, type: 'break', startMinuteOffset: offset, durationMinutes: brk })
    offset += brk
    if (isLong) sinceLongBreak = 0
  }

  return blocks
}

/** Energy-aware suggestion: average completed session length for a given energy level. */
export function suggestedLengthForEnergy(sessions: FocusSession[], energy: EnergyLevel): number | null {
  const matching = sessions.filter((s) => s.type === 'focus' && s.completed && s.energyBefore === energy)
  if (matching.length < 3) return null
  const avg = average(matching.map((s) => s.actualSeconds / 60))
  return roundToFive(avg)
}
