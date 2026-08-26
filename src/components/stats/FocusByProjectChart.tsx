import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ProjectPoint } from '../../lib/stats'

const PALETTE = ['#f97316', '#6366f1', '#22c55e', '#eab308', '#ec4899', '#06b6d4', '#a855f7']

export function FocusByProjectChart({ data }: { data: ProjectPoint[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-slate-500 py-10 text-center">Noch keine Sessions mit Projekt verknüpft.</div>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="minutes" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.id} fill={PALETTE[i % PALETTE.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#161f36', border: '1px solid #2a3856', borderRadius: 12, fontSize: 13 }}
          formatter={(v: number) => [`${v} min`, 'Fokuszeit']}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
