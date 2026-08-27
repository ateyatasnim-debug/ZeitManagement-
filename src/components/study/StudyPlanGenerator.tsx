import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { generateStudyPlan } from '../../lib/insights'
import { formatMinutes } from '../../lib/format'

export function StudyPlanGenerator() {
  const presets = useStore((s) => s.settings.customPresets)
  const [topic, setTopic] = useState('')
  const [totalMinutes, setTotalMinutes] = useState(120)
  const [presetId, setPresetId] = useState(presets[0]?.id)
  const [startTime, setStartTime] = useState('09:00')
  const [generated, setGenerated] = useState(false)

  const preset = presets.find((p) => p.id === presetId) ?? presets[0]

  const blocks = useMemo(() => {
    if (!preset) return []
    return generateStudyPlan(totalMinutes, preset.focusMinutes, preset.breakMinutes, preset.longBreakMinutes, preset.sessionsUntilLongBreak)
  }, [totalMinutes, preset])

  const timeLabel = (offset: number) => {
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + offset
    const hh = Math.floor((total % 1440) / 60)
    const mm = Math.floor(total % 60)
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">📋 Lerntag planen</div>
      <p className="text-xs text-slate-500 mb-3">
        Wie viel willst du heute insgesamt lernen? Dieser Rechner teilt die Zeit automatisch in Fokus- und
        Pausenblöcke nach deinem Preset auf und zeigt dir eine feste Uhrzeit für jeden Block – als Vorlage zum
        Abarbeiten, du startest die einzelnen Blöcke dann ganz normal im Timer.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Thema / Fach
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z. B. Mathematik"
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          />
        </label>
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Startzeit
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          />
        </label>
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Gesamtdauer (Minuten)
          <input
            type="number"
            min={10}
            step={10}
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(Number(e.target.value))}
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          />
        </label>
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Preset
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      <button className="btn-primary w-full" onClick={() => setGenerated(true)}>Lernplan erstellen</button>

      {generated && blocks.length > 0 && (
        <div className="mt-4 space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {blocks.map((b) => (
            <div
              key={b.index}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                b.type === 'focus' ? 'bg-accent/10' : 'bg-base-800'
              }`}
            >
              <span className="font-medium tabular-nums">{timeLabel(b.startMinuteOffset)}</span>
              <span className={b.type === 'focus' ? 'text-accent font-medium' : 'text-slate-400'}>
                {b.type === 'focus' ? `📖 ${topic || 'Lernen'}` : '☕ Pause'}
              </span>
              <span className="text-slate-500 tabular-nums">{formatMinutes(b.durationMinutes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
