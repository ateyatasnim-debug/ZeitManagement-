import type { EnergyLevel } from '../../types'

const OPTIONS: { id: EnergyLevel; label: string; icon: string }[] = [
  { id: 'low', label: 'Niedrig', icon: '😴' },
  { id: 'normal', label: 'Normal', icon: '😐' },
  { id: 'high', label: 'Hoch', icon: '⚡' }
]

interface Props {
  value: EnergyLevel | undefined
  onChange: (v: EnergyLevel) => void
}

export function EnergyPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Wie fühlst du dich?</div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-sm font-medium border transition ${
              value === o.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/5 bg-base-800 text-slate-300 hover:bg-base-700'
            }`}
          >
            <span className="text-lg">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
