import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { Preset } from '../../types'

interface Props {
  activePresetId: string
  onSelect: (id: string) => void
}

export function PresetPicker({ activePresetId, onSelect }: Props) {
  const presets = useStore((s) => s.settings.customPresets)
  const addCustomPreset = useStore((s) => s.addCustomPreset)
  const deleteCustomPreset = useStore((s) => s.deleteCustomPreset)
  const [showCustom, setShowCustom] = useState(false)
  const [focusM, setFocusM] = useState(40)
  const [breakM, setBreakM] = useState(8)
  const [longBreakM, setLongBreakM] = useState(20)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Zeit-Preset</div>
        <button onClick={() => setShowCustom((v) => !v)} className="text-xs text-accent font-semibold">
          {showCustom ? 'Abbrechen' : '+ Eigene Zeit'}
        </button>
      </div>

      {showCustom ? (
        <div className="card p-3 mb-2 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Fokus" value={focusM} onChange={setFocusM} />
            <NumberField label="Pause" value={breakM} onChange={setBreakM} />
            <NumberField label="Lange Pause" value={longBreakM} onChange={setLongBreakM} />
          </div>
          <button
            className="btn-primary w-full"
            onClick={() => {
              addCustomPreset(`${focusM} / ${breakM} eigene Zeit`, focusM, breakM, longBreakM)
              setShowCustom(false)
            }}
          >
            Preset speichern
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {presets.map((p: Preset) => (
          <div key={p.id} className="relative group">
            <button
              onClick={() => onSelect(p.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition ${
                activePresetId === p.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/5 bg-base-800 text-slate-300 hover:bg-base-700'
              }`}
            >
              {p.name}
            </button>
            {!['classic', 'deep', 'sprint'].includes(p.id) && (
              <button
                onClick={() => deleteCustomPreset(p.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-base-600 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                aria-label="Preset löschen"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="text-xs text-slate-400 flex flex-col gap-1">
      {label}
      <input
        type="number"
        min={1}
        max={180}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-base-700 rounded-lg px-2 py-1.5 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  )
}
