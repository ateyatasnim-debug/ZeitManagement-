import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeekCompare } from '../../lib/stats'

export function WeekCompareChart({ data }: { data: WeekCompare[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#1f2b47" vertical={false} />
        <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{ background: '#161f36', border: '1px solid #2a3856', borderRadius: 12, fontSize: 13 }}
          formatter={(v: number) => [`${v} min`]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Bar dataKey="lastWeek" name="Letzte Woche" radius={[6, 6, 0, 0]} fill="#2a3856" />
        <Bar dataKey="thisWeek" name="Diese Woche" radius={[6, 6, 0, 0]} fill="#f97316" />
      </BarChart>
    </ResponsiveContainer>
  )
}
