import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore, elapsedSeconds } from '../../store/useStore'
import { useTicker } from '../../lib/useTicker'
import { TimerRing } from './TimerRing'
import { PresetPicker } from './PresetPicker'
import { EnergyPicker } from './EnergyPicker'
import { DistractionModal } from './DistractionModal'
import { SoundscapePicker } from './SoundscapePicker'
import { SessionSummaryModal } from './SessionSummaryModal'
import { AdaptiveSuggestionBanner } from './AdaptiveSuggestionBanner'
import { DailyInsightCard } from './DailyInsightCard'
import { DailyGoalCard } from '../goal/DailyGoalCard'
import { TreeGrowth } from '../gamification/TreeGrowth'
import { XPBar } from '../gamification/XPBar'
import { suggestedLengthForEnergy } from '../../lib/insights'
import { requestNotificationPermission, sendNotification } from '../../lib/notifications'
import { useConfirm } from '../../lib/confirm'
import { formatMinutes } from '../../lib/format'
import type { EnergyLevel, FocusSession, Preset, SessionType } from '../../types'

interface Props {
  onEnterFocusMode: () => void
  prefillProjectId?: string
  onPrefillConsumed: () => void
}

const PHASE_LABEL: Record<SessionType, string> = {
  focus: 'Fokus',
  short_break: 'Pause',
  long_break: 'Lange Pause'
}

export function TimerView({ onEnterFocusMode, prefillProjectId, onPrefillConsumed }: Props) {
  const activeSession = useStore((s) => s.activeSession)
  const settings = useStore((s) => s.settings)
  const sessions = useStore((s) => s.sessions)
  const projects = useStore((s) => s.projects)
  const cycleCount = useStore((s) => s.cycleCount)
  const startSession = useStore((s) => s.startSession)
  const pauseSession = useStore((s) => s.pauseSession)
  const resumeSession = useStore((s) => s.resumeSession)
  const addDistraction = useStore((s) => s.addDistraction)
  const finishSession = useStore((s) => s.finishSession)
  const confirm = useConfirm()

  const [presetId, setPresetId] = useState(settings.activePresetId)
  const [projectId, setProjectId] = useState<string | undefined>(undefined)
  const [taskLabel, setTaskLabel] = useState('')
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(undefined)
  const [distractionOpen, setDistractionOpen] = useState(false)
  const [summarySession, setSummarySession] = useState<FocusSession | null>(null)
  const [pendingNext, setPendingNext] = useState<{ type: SessionType; minutes: number } | null>(null)
  const finishedRef = useRef(false)

  const preset: Preset =
    settings.customPresets.find((p) => p.id === presetId) ?? settings.customPresets[0]

  useTicker(activeSession?.status === 'running')

  useEffect(() => {
    if (settings.notificationsEnabled) requestNotificationPermission()
  }, [settings.notificationsEnabled])

  useEffect(() => {
    if (!prefillProjectId) return
    setProjectId(prefillProjectId)
    onPrefillConsumed()
  }, [prefillProjectId, onPrefillConsumed])

  const remaining = activeSession
    ? Math.max(0, activeSession.plannedMinutes * 60 - elapsedSeconds(activeSession))
    : 0

  useEffect(() => {
    finishedRef.current = false
  }, [activeSession?.startedAt])

  useEffect(() => {
    if (!activeSession) return
    if (activeSession.status !== 'running') return
    if (remaining > 0) return
    if (finishedRef.current) return
    finishedRef.current = true
    handleFinish(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, activeSession])

  const energySuggestion = useMemo(() => {
    if (!energy || !settings.adaptiveSuggestionsEnabled) return null
    return suggestedLengthForEnergy(sessions, energy)
  }, [energy, sessions, settings.adaptiveSuggestionsEnabled])

  function nextPhaseAfterFocus(): { type: SessionType; minutes: number } {
    const isLong = cycleCount > 0 && cycleCount % preset.sessionsUntilLongBreak === 0
    return isLong
      ? { type: 'long_break', minutes: preset.longBreakMinutes }
      : { type: 'short_break', minutes: preset.breakMinutes }
  }

  function handleFinish(completed: boolean) {
    if (!activeSession) return
    const type = activeSession.type
    finishSession(completed)
    const last = useStore.getState().sessions.at(-1) ?? null

    if (settings.notificationsEnabled) {
      sendNotification(
        type === 'focus' ? 'Fokus-Session beendet 🎉' : 'Pause vorbei ⏰',
        type === 'focus' ? 'Gut gemacht! Zeit für eine Pause.' : 'Zeit für die nächste Fokus-Session.',
        settings.focusModeMuteNotifications
      )
    }

    if (type === 'focus') {
      setSummarySession(last)
      const next = nextPhaseAfterFocus()
      setPendingNext(next)
      if (settings.autoStartBreaks) {
        startSession(next.type, next.minutes)
        setPendingNext(null)
      }
    } else {
      setSummarySession(last)
      setPendingNext({ type: 'focus', minutes: preset.focusMinutes })
      if (settings.autoStartFocus) {
        startSession('focus', preset.focusMinutes, { projectId, taskLabel: taskLabel || undefined, energyBefore: energy })
        setPendingNext(null)
      }
    }
  }

  function handleSkipBreak() {
    handleFinish(false)
  }

  async function handleEndFocusEarly() {
    if (!activeSession) return
    const minutesSoFar = elapsedSeconds(activeSession) / 60
    const ok = await confirm({
      title: 'Session beenden?',
      message: `Deine bisherige Zeit (${formatMinutes(minutesSoFar)}) wird gespeichert und zählt zu deiner Statistik. Die Session gilt als vorzeitig beendet.`,
      confirmLabel: 'Beenden',
      danger: true
    })
    if (ok) handleFinish(false)
  }

  function handleStartFocus() {
    const minutes = preset.focusMinutes
    startSession('focus', minutes, { projectId, taskLabel: taskLabel || undefined, energyBefore: energy })
    setPendingNext(null)
  }

  function handleStartPending() {
    if (!pendingNext) return
    startSession(pendingNext.type, pendingNext.minutes, pendingNext.type === 'focus' ? { projectId, taskLabel: taskLabel || undefined, energyBefore: energy } : undefined)
    setPendingNext(null)
  }

  const flatProjects = useMemo(() => {
    const roots = projects.filter((p) => !p.parentId)
    const children = (id: string) => projects.filter((p) => p.parentId === id)
    const out: { id: string; label: string }[] = []
    const walk = (p: (typeof projects)[number], depth: number) => {
      out.push({ id: p.id, label: `${'— '.repeat(depth)}${p.emoji} ${p.name}` })
      for (const c of children(p.id)) walk(c, depth + 1)
    }
    for (const r of roots) walk(r, 0)
    return out
  }, [projects])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">⏱️ Pomodoro Timer</h1>

      {!activeSession && <AdaptiveSuggestionBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-6 flex flex-col items-center">
          {activeSession ? (
            <>
              <TimerRing remainingSeconds={remaining} totalSeconds={activeSession.plannedMinutes * 60} label={PHASE_LABEL[activeSession.type]} />
              {activeSession.taskLabel && (
                <div className="mt-3 text-sm text-slate-300 font-medium">🎯 {activeSession.taskLabel}</div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {activeSession.status === 'running' ? (
                  <button className="btn-secondary" onClick={pauseSession}>⏸ Pause</button>
                ) : (
                  <button className="btn-primary" onClick={resumeSession}>▶️ Fortsetzen</button>
                )}
                {activeSession.type === 'focus' ? (
                  <>
                    <button className="btn-secondary" onClick={() => setDistractionOpen(true)}>
                      📱 Ich wurde abgelenkt
                    </button>
                    <button className="btn-primary" onClick={onEnterFocusMode}>🔒 Fokus-Modus</button>
                    <button className="btn-ghost text-rose-400" onClick={handleEndFocusEarly}>Beenden</button>
                  </>
                ) : (
                  <button className="btn-ghost" onClick={handleSkipBreak}>⏭ Pause überspringen</button>
                )}
              </div>
              {(activeSession.pauseCount > 0 || activeSession.distractions.length > 0) && (
                <div className="mt-4 text-xs text-slate-500">
                  {activeSession.pauseCount > 0 && <span>⏸ {activeSession.pauseCount}× pausiert&nbsp;&nbsp;</span>}
                  {activeSession.distractions.length > 0 && <span>📱 {activeSession.distractions.length}× abgelenkt</span>}
                </div>
              )}
            </>
          ) : (
            <>
              <TimerRing remainingSeconds={preset.focusMinutes * 60} totalSeconds={preset.focusMinutes * 60} label="Bereit" />

              {pendingNext && (
                <div className="w-full mt-5 card p-3 border-accent/30 bg-accent/5 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    Als nächstes: {PHASE_LABEL[pendingNext.type]} ({formatMinutes(pendingNext.minutes)})
                  </span>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm py-1.5 px-3" onClick={handleStartPending}>Starten</button>
                    <button className="btn-ghost text-sm py-1.5 px-3" onClick={() => setPendingNext(null)}>Verwerfen</button>
                  </div>
                </div>
              )}

              <div className="w-full mt-6 space-y-4">
                <PresetPicker activePresetId={presetId} onSelect={setPresetId} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-slate-400 flex flex-col gap-1">
                    Projekt (optional)
                    <select
                      value={projectId ?? ''}
                      onChange={(e) => setProjectId(e.target.value || undefined)}
                      className="bg-base-800 border border-white/5 rounded-lg px-2.5 py-2 text-sm text-slate-100 outline-none"
                    >
                      <option value="">Kein Projekt</option>
                      {flatProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-slate-400 flex flex-col gap-1">
                    Aufgabe (optional)
                    <input
                      value={taskLabel}
                      onChange={(e) => setTaskLabel(e.target.value)}
                      placeholder="z. B. Mathematik lernen"
                      className="bg-base-800 border border-white/5 rounded-lg px-2.5 py-2 text-sm text-slate-100 outline-none"
                    />
                  </label>
                </div>

                <EnergyPicker value={energy} onChange={setEnergy} />
                {energySuggestion && (
                  <div className="text-xs text-focus bg-focus/10 rounded-lg px-3 py-2">
                    Bei dieser Energie schaffst du im Schnitt {energySuggestion} Minuten fokussiert.
                  </div>
                )}

                <button className="btn-primary w-full text-base py-3" onClick={handleStartFocus}>
                  ▶️ Start ({formatMinutes(preset.focusMinutes)})
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <XPBar />
          <DailyGoalCard />
          <TreeGrowth />
          <div className="card p-4">
            <SoundscapePicker />
          </div>
          <DailyInsightCard />
        </div>
      </div>

      <DistractionModal
        open={distractionOpen}
        onClose={() => setDistractionOpen(false)}
        onSelect={(reason) => addDistraction(reason)}
      />
      <SessionSummaryModal session={summarySession} onClose={() => setSummarySession(null)} />
    </div>
  )
}
