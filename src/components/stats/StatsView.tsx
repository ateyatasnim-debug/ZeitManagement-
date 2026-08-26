import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { computeSummary, focusPerDay, focusPerHour, focusPerProject, weekComparison } from '../../lib/stats'
import { formatMinutes } from '../../lib/format'
import { FocusPerDayChart } from './FocusPerDayChart'
import { FocusPerHourChart } from './FocusPerHourChart'
import { FocusByProjectChart } from './FocusByProjectChart'
import { WeekCompareChart } from './WeekCompareChart'
import { DistractionSummaryCard } from './DistractionSummaryCard'

export function StatsView() {
  const sessions = useStore((s) => s.sessions)
  const projects = useStore((s) => s.projects)

  const summary = useMemo(() => computeSummary(sessions), [sessions])
  const dayData = useMemo(() => focusPerDay(sessions, 14), [sessions])
  const hourData = useMemo(() => focusPerHour(sessions), [sessions])
  const projectData = useMemo(() => focusPerProject(sessions, projects), [sessions, projects])
  const weekData = useMemo(() => weekComparison(sessions), [sessions])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">📊 Statistik</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Heute" value={formatMinutes(summary.focusMinutesToday)} />
        <StatTile label="Diese Woche" value={formatMinutes(summary.focusMinutesWeek)} />
        <StatTile label="Dieser Monat" value={formatMinutes(summary.focusMinutesMonth)} />
        <StatTile label="Sessions" value={String(summary.sessionsCount)} />
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <Row label="Ø Session-Länge" value={formatMinutes(summary.avgSessionMinutes)} />
            <Row label="Erfolgsrate" value={`${Math.round(summary.successRate * 100)}%`} />
            <Row label="Beste Uhrzeit" value={summary.bestHourLabel ?? '–'} />
            <Row label="Längste Session" value={formatMinutes(summary.longestSessionMinutes)} last />
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <ChartTitle icon="📈" title="Fokuszeit pro Tag (14 Tage)" />
          <FocusPerDayChart data={dayData} />
        </div>
        <div className="card p-4">
          <ChartTitle icon="🕐" title="Fokus nach Uhrzeit" />
          <FocusPerHourChart data={hourData} />
        </div>
        <div className="card p-4">
          <ChartTitle icon="📚" title="Fokus nach Projekt" />
          <FocusByProjectChart data={projectData} />
        </div>
        <div className="card p-4">
          <ChartTitle icon="📅" title="Wochenvergleich" />
          <WeekCompareChart data={weekData} />
        </div>
      </div>

      <DistractionSummaryCard />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <tr className={last ? '' : 'border-b border-white/5'}>
      <td className="py-2 text-slate-400">{label}</td>
      <td className="py-2 text-right font-semibold">{value}</td>
    </tr>
  )
}

function ChartTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
      <span>{icon}</span> {title}
    </div>
  )
}
