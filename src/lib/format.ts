export function toDateKey(ts: number | Date): string {
  const d = typeof ts === 'number' ? new Date(ts) : ts
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function isSameDay(a: number, b: number): boolean {
  return toDateKey(a) === toDateKey(b)
}

export function startOfWeek(d: Date = new Date()): Date {
  const day = d.getDay() === 0 ? 7 : d.getDay() // Monday = 1
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  start.setDate(d.getDate() - (day - 1))
  return start
}

export function startOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)
  if (h <= 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatDayShort(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'short' })
}

export function formatDateHuman(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function daysUntil(dateKey: string): number {
  const target = new Date(dateKey + 'T00:00:00').getTime()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target - now.getTime()) / 86400000)
}
