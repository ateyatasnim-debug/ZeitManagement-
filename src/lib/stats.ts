import type { FocusSession, Project } from '../types'
import { daysAgo, startOfMonth, startOfWeek, toDateKey, formatDayShort } from './format'

function completedFocus(sessions: FocusSession[]): FocusSession[] {
  return sessions.filter((s) => s.type === 'focus' && s.completed)
}

export interface SummaryStats {
  focusMinutesToday: number
  focusMinutesWeek: number
  focusMinutesMonth: number
  sessionsCount: number
  avgSessionMinutes: number
  successRate: number
  bestHourLabel: string | null
  longestSessionMinutes: number
}

export function computeSummary(sessions: FocusSession[]): SummaryStats {
  const focus = sessions.filter((s) => s.type === 'focus')
  const completed = completedFocus(sessions)

  const today = toDateKey(new Date())
  const weekStart = startOfWeek().getTime()
  const monthStart = startOfMonth().getTime()

  const minutesSince = (start: number) =>
    completed.filter((s) => s.startedAt >= start).reduce((sum, s) => sum + s.actualSeconds / 60, 0)

  const focusMinutesToday = completed
    .filter((s) => toDateKey(s.startedAt) === today)
    .reduce((sum, s) => sum + s.actualSeconds / 60, 0)

  const totalMinutes = completed.reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  const avgSessionMinutes = completed.length > 0 ? totalMinutes / completed.length : 0
  const successRate = focus.length > 0 ? completed.length / focus.length : 0

  const hourTotals = new Array(24).fill(0)
  for (const s of completed) hourTotals[new Date(s.startedAt).getHours()] += s.actualSeconds / 60
  const bestHour = hourTotals.reduce((best, v, i) => (v > hourTotals[best] ? i : best), 0)
  const bestHourLabel = totalMinutes > 0 ? `${String(bestHour).padStart(2, '0')}–${String((bestHour + 1) % 24).padStart(2, '0')} Uhr` : null

  const longestSessionMinutes = completed.reduce((max, s) => Math.max(max, s.actualSeconds / 60), 0)

  return {
    focusMinutesToday,
    focusMinutesWeek: minutesSince(weekStart),
    focusMinutesMonth: minutesSince(monthStart),
    sessionsCount: completed.length,
    avgSessionMinutes,
    successRate,
    bestHourLabel,
    longestSessionMinutes
  }
}

export interface DayPoint {
  date: string
  label: string
  minutes: number
}

export function focusPerDay(sessions: FocusSession[], days: number): DayPoint[] {
  const completed = completedFocus(sessions)
  const points: DayPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i)
    const key = toDateKey(d)
    const minutes = completed
      .filter((s) => toDateKey(s.startedAt) === key)
      .reduce((sum, s) => sum + s.actualSeconds / 60, 0)
    points.push({ date: key, label: formatDayShort(key), minutes: Math.round(minutes) })
  }
  return points
}

export interface HourPoint {
  hour: string
  minutes: number
}

export function focusPerHour(sessions: FocusSession[]): HourPoint[] {
  const completed = completedFocus(sessions)
  const totals = new Array(24).fill(0)
  for (const s of completed) totals[new Date(s.startedAt).getHours()] += s.actualSeconds / 60
  return totals.map((minutes, hour) => ({ hour: `${hour}`, minutes: Math.round(minutes) }))
}

export interface ProjectPoint {
  id: string
  name: string
  color: string
  minutes: number
}

export function focusPerProject(sessions: FocusSession[], projects: Project[]): ProjectPoint[] {
  const completed = completedFocus(sessions).filter((s) => s.projectId)
  const totals = new Map<string, number>()
  for (const s of completed) {
    totals.set(s.projectId!, (totals.get(s.projectId!) || 0) + s.actualSeconds / 60)
  }
  return [...totals.entries()]
    .map(([id, minutes]) => {
      const p = projects.find((x) => x.id === id)
      return { id, name: p ? `${p.emoji} ${p.name}` : 'Unbekannt', color: p?.color ?? '#6366f1', minutes: Math.round(minutes) }
    })
    .sort((a, b) => b.minutes - a.minutes)
}

export interface WeekCompare {
  label: string
  thisWeek: number
  lastWeek: number
}

export function weekComparison(sessions: FocusSession[]): WeekCompare[] {
  const completed = completedFocus(sessions)
  const thisWeekStart = startOfWeek()
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  return days.map((label, i) => {
    const thisDay = new Date(thisWeekStart)
    thisDay.setDate(thisDay.getDate() + i)
    const lastDay = new Date(lastWeekStart)
    lastDay.setDate(lastDay.getDate() + i)

    const thisKey = toDateKey(thisDay)
    const lastKey = toDateKey(lastDay)

    const thisWeek = completed.filter((s) => toDateKey(s.startedAt) === thisKey).reduce((sum, s) => sum + s.actualSeconds / 60, 0)
    const lastWeek = completed.filter((s) => toDateKey(s.startedAt) === lastKey).reduce((sum, s) => sum + s.actualSeconds / 60, 0)

    return { label, thisWeek: Math.round(thisWeek), lastWeek: Math.round(lastWeek) }
  })
}

export function distractionBreakdown(sessions: FocusSession[]): { reason: string; icon: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const s of sessions) {
    for (const d of s.distractions) {
      counts.set(d.reason, (counts.get(d.reason) || 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, icon: '', count }))
}
