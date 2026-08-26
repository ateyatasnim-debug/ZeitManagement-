import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { soundscapeEngine, SOUNDSCAPES } from '../../lib/audio'

export function SoundscapePicker() {
  const soundscape = useStore((s) => s.settings.soundscape)
  const volume = useStore((s) => s.settings.soundscapeVolume)
  const updateSettings = useStore((s) => s.updateSettings)
  const started = useRef(false)

  useEffect(() => {
    soundscapeEngine.setVolume(volume)
  }, [volume])

  useEffect(() => {
    return () => {
      soundscapeEngine.stop()
    }
  }, [])

  const select = (id: (typeof SOUNDSCAPES)[number]['id']) => {
    updateSettings({ soundscape: id })
    started.current = true
    soundscapeEngine.play(id)
  }

  return (
    <div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Soundscape</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SOUNDSCAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => select(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
              soundscape === s.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/5 bg-base-800 text-slate-300 hover:bg-base-700'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
      {soundscape !== 'none' && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => updateSettings({ soundscapeVolume: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      )}
    </div>
  )
}
