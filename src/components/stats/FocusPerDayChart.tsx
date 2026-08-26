import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayPoint } from '../../lib/stats'

export function FocusPerDayChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#1f2b47" vertical={false} />
        <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{ background: '#161f36', border: '1px solid #2a3856', borderRadius: 12, fontSize: 13 }}
          formatter={(v: number) => [`${v} min`, 'Fokuszeit']}
        />
        <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="#f97316" />
      </BarChart>
    </ResponsiveContainer>
  )
}
