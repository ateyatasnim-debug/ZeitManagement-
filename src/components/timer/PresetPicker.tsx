import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useConfirm } from '../../lib/confirm'
import type { Preset } from '../../types'

interface Props {
  activePresetId: string
  onSelect: (id: string) => void
}

export function PresetPicker({ activePresetId, onSelect }: Props) {
  const presets = useStore((s) => s.settings.customPresets)
  const addCustomPreset = useStore((s) => s.addCustomPreset)
  const deleteCustomPreset = useStore((s) => s.deleteCustomPreset)
  const confirm = useConfirm()
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
        <div className="card p-3 mb-2 space-y-3">
          <HourMinuteField label="Fokuszeit" totalMinutes={focusM} onChange={setFocusM} />
          <HourMinuteField label="Pause" totalMinutes={breakM} onChange={setBreakM} />
          <HourMinuteField label="Lange Pause" totalMinutes={longBreakM} onChange={setLongBreakM} />
          <button
            className="btn-primary w-full"
            onClick={() => {
              addCustomPreset(`${formatShort(focusM)} / ${formatShort(breakM)} eigene Zeit`, focusM, breakM, longBreakM)
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
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Preset löschen?',
                    message: `„${p.name}" wird entfernt.`,
                    confirmLabel: 'Löschen',
                    danger: true
                  })
                  if (ok) deleteCustomPreset(p.id)
                }}
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

function formatShort(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

const MAX_TOTAL_MINUTES = 8 * 60

function HourMinuteField({
  label,
  totalMinutes,
  onChange
}: {
  label: string
  totalMinutes: number
  onChange: (n: number) => void
}) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const set = (h: number, m: number) => {
    const clampedH = Math.max(0, Math.min(8, h))
    const clampedM = Math.max(0, Math.min(59, m))
    const total = Math.max(1, Math.min(MAX_TOTAL_MINUTES, clampedH * 60 + clampedM))
    onChange(total)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={8}
          value={hours}
          onChange={(e) => set(Number(e.target.value), minutes)}
          className="w-14 bg-base-700 rounded-lg px-2 py-1.5 text-slate-100 text-sm text-right outline-none focus:ring-2 focus:ring-accent"
        />
        <span className="text-xs text-slate-500">Std</span>
        <input
          type="number"
          min={0}
          max={59}
          step={5}
          value={minutes}
          onChange={(e) => set(hours, Number(e.target.value))}
          className="w-14 bg-base-700 rounded-lg px-2 py-1.5 text-slate-100 text-sm text-right outline-none focus:ring-2 focus:ring-accent"
        />
        <span className="text-xs text-slate-500">Min</span>
      </div>
    </div>
  )
}
