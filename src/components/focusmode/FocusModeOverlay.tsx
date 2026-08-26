import { useEffect, useState } from 'react'
import { useStore, elapsedSeconds } from '../../store/useStore'
import { useTicker } from '../../lib/useTicker'
import { formatSeconds } from '../../lib/format'

interface Props {
  onClose: () => void
}

export function FocusModeOverlay({ onClose }: Props) {
  const activeSession = useStore((s) => s.activeSession)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const pauseSession = useStore((s) => s.pauseSession)
  const resumeSession = useStore((s) => s.resumeSession)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useTicker(activeSession?.status === 'running')

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!activeSession) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession])

  if (!activeSession) return null

  const remaining = Math.max(0, activeSession.plannedMinutes * 60 - elapsedSeconds(activeSession))

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* fullscreen may be unavailable (e.g. iPad Safari restrictions) */
    }
  }

  const exit = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* noop */
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-base-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-sm uppercase tracking-[0.3em] text-accent font-bold mb-6 flex items-center gap-2">
        🔒 Focus Mode
      </div>

      <div className="text-7xl sm:text-8xl font-extrabold tabular-nums mb-3">{formatSeconds(remaining)}</div>
      <div className="text-slate-400 mb-1">verbleibend</div>
      {activeSession.taskLabel && <div className="text-lg font-medium mt-4">🎯 {activeSession.taskLabel}</div>}

      <div className="flex gap-3 mt-8">
        {activeSession.status === 'running' ? (
          <button className="btn-secondary" onClick={pauseSession}>⏸ Pause</button>
        ) : (
          <button className="btn-primary" onClick={resumeSession}>▶️ Fortsetzen</button>
        )}
        <button className="btn-ghost" onClick={exit}>Fokus-Modus verlassen</button>
      </div>

      <div className="mt-10 w-full max-w-sm space-y-3 text-left">
        <ToggleRow
          label="Benachrichtigungen stumm"
          checked={settings.focusModeMuteNotifications}
          onChange={(v) => updateSettings({ focusModeMuteNotifications: v })}
        />
        <ToggleRow
          label="Vollbildmodus"
          checked={isFullscreen}
          onChange={toggleFullscreen}
        />
        <ToggleRow
          label="Ablenkende Websites/Apps meiden (Erinnerung)"
          checked={settings.focusModeBlockReminder}
          onChange={(v) => updateSettings({ focusModeBlockReminder: v })}
        />
        {settings.focusModeBlockReminder && (
          <p className="text-xs text-slate-500 leading-relaxed">
            Hinweis: Browser können aus Sicherheitsgründen keine Apps oder Websites systemweit blockieren.
            FocusFlow erinnert dich stattdessen aktiv daran, dein Handy wegzulegen und Ablenkungen zu vermeiden.
          </p>
        )}
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-base-900 border border-white/5"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span
        className={`w-10 h-6 rounded-full flex items-center px-0.5 transition ${checked ? 'bg-accent justify-end' : 'bg-base-700 justify-start'}`}
      >
        <span className="w-5 h-5 rounded-full bg-white block" />
      </span>
    </button>
  )
}
