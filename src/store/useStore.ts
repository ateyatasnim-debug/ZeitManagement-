import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  DistractionEvent,
  DistractionReason,
  EnergyLevel,
  Exam,
  FocusSession,
  Project,
  SessionType,
  Settings,
  SoundscapeId
} from '../types'
import { uid } from '../lib/id'
import { DEFAULT_PRESETS } from '../lib/presets'
import { computeFocusScore } from '../lib/focusScore'
import { evaluateAchievements } from '../lib/achievements'
import { XP_RULES } from '../lib/xp'
import { todayKey, toDateKey } from '../lib/format'

export interface ActiveSession {
  type: SessionType
  projectId?: string
  taskLabel?: string
  plannedMinutes: number
  status: 'running' | 'paused'
  startedAt: number
  legStartedAt: number
  accumulatedSeconds: number
  pauseCount: number
  distractions: DistractionEvent[]
  energyBefore?: EnergyLevel
}

interface StoreState extends AppState {
  activeSession: ActiveSession | null
  cycleCount: number
  pendingToasts: { id: string; kind: 'achievement' | 'levelup'; payload: any }[]

  addProject: (name: string, emoji: string, color: string, parentId?: string) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void

  addExam: (subject: string, date: string, hoursGoal: number, color: string, projectId?: string) => string
  deleteExam: (id: string) => void
  updateExam: (id: string, patch: Partial<Exam>) => void

  updateSettings: (patch: Partial<Settings>) => void
  addCustomPreset: (name: string, focusMinutes: number, breakMinutes: number, longBreakMinutes: number) => void
  deleteCustomPreset: (id: string) => void

  startSession: (
    type: SessionType,
    plannedMinutes: number,
    opts?: { projectId?: string; taskLabel?: string; energyBefore?: EnergyLevel }
  ) => void
  pauseSession: () => void
  resumeSession: () => void
  addDistraction: (reason: DistractionReason, note?: string) => void
  finishSession: (completedNaturally: boolean) => void

  dismissToast: (id: string) => void
  dismissAdaptiveSuggestion: () => void
}

const defaultSettings: Settings = {
  dailyGoalMinutes: 120,
  activePresetId: 'classic',
  customPresets: DEFAULT_PRESETS,
  autoStartBreaks: true,
  autoStartFocus: false,
  notificationsEnabled: false,
  soundscape: 'none',
  soundscapeVolume: 0.5,
  focusModeFullscreen: true,
  focusModeMuteNotifications: true,
  focusModeBlockReminder: true,
  adaptiveSuggestionsEnabled: true
}

export function elapsedSeconds(session: ActiveSession): number {
  const legSeconds = session.status === 'running' ? (Date.now() - session.legStartedAt) / 1000 : 0
  return session.accumulatedSeconds + legSeconds
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      projects: [],
      exams: [],
      xpEvents: [],
      unlockedAchievements: [],
      settings: defaultSettings,
      streakDates: [],
      activeSession: null,
      cycleCount: 0,
      pendingToasts: [],

      addProject: (name, emoji, color, parentId) => {
        const id = uid()
        const project: Project = { id, name, emoji, color, parentId, createdAt: Date.now() }
        set((s) => ({ projects: [...s.projects, project] }))
        return id
      },
      updateProject: (id, patch) => {
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
      },
      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id && p.parentId !== id)
        }))
      },

      addExam: (subject, date, hoursGoal, color, projectId) => {
        const id = uid()
        const exam: Exam = { id, subject, date, hoursGoal, projectId, color, createdAt: Date.now() }
        set((s) => ({ exams: [...s.exams, exam] }))
        return id
      },
      deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addCustomPreset: (name, focusMinutes, breakMinutes, longBreakMinutes) => {
        const preset = {
          id: uid(),
          name,
          focusMinutes,
          breakMinutes,
          longBreakMinutes,
          sessionsUntilLongBreak: 4
        }
        set((s) => ({ settings: { ...s.settings, customPresets: [...s.settings.customPresets, preset] } }))
      },
      deleteCustomPreset: (id) => {
        set((s) => ({
          settings: { ...s.settings, customPresets: s.settings.customPresets.filter((p) => p.id !== id) }
        }))
      },

      startSession: (type, plannedMinutes, opts) => {
        const now = Date.now()
        const active: ActiveSession = {
          type,
          projectId: opts?.projectId,
          taskLabel: opts?.taskLabel,
          plannedMinutes,
          status: 'running',
          startedAt: now,
          legStartedAt: now,
          accumulatedSeconds: 0,
          pauseCount: 0,
          distractions: [],
          energyBefore: opts?.energyBefore
        }
        set({ activeSession: active })
      },

      pauseSession: () => {
        const active = get().activeSession
        if (!active || active.status !== 'running') return
        set({
          activeSession: {
            ...active,
            status: 'paused',
            accumulatedSeconds: elapsedSeconds(active),
            pauseCount: active.pauseCount + 1
          }
        })
      },

      resumeSession: () => {
        const active = get().activeSession
        if (!active || active.status !== 'paused') return
        set({ activeSession: { ...active, status: 'running', legStartedAt: Date.now() } })
      },

      addDistraction: (reason, note) => {
        const active = get().activeSession
        if (!active) return
        const event: DistractionEvent = { id: uid(), timestamp: Date.now(), reason, note }
        set({ activeSession: { ...active, distractions: [...active.distractions, event] } })
      },

      finishSession: (completedNaturally) => {
        const active = get().activeSession
        if (!active) return
        const actualSeconds = Math.min(elapsedSeconds(active), active.plannedMinutes * 60 + 5)

        const sessionDraft: Omit<FocusSession, 'id' | 'focusScore'> = {
          type: active.type,
          projectId: active.projectId,
          taskLabel: active.taskLabel,
          plannedMinutes: active.plannedMinutes,
          actualSeconds,
          startedAt: active.startedAt,
          endedAt: Date.now(),
          completed: completedNaturally,
          pauseCount: active.pauseCount,
          distractions: active.distractions,
          energyBefore: active.energyBefore
        }
        const focusScore = active.type === 'focus' ? computeFocusScore(sessionDraft) : undefined
        const session: FocusSession = { ...sessionDraft, id: uid(), focusScore }

        set((s) => {
          const sessions = [...s.sessions, session]
          let xpEvents = s.xpEvents
          let streakDates = s.streakDates
          let cycleCount = s.cycleCount

          if (session.type === 'focus') {
            const minutes = session.actualSeconds / 60
            const events = []
            if (minutes >= 1) {
              events.push({
                id: uid(),
                amount: Math.round(minutes * XP_RULES.perFocusMinute),
                reason: `${Math.round(minutes)} Min. Fokuszeit`,
                timestamp: Date.now()
              })
            }
            if (session.completed) {
              events.push({
                id: uid(),
                amount: XP_RULES.sessionCompleted,
                reason: 'Session abgeschlossen',
                timestamp: Date.now()
              })
              cycleCount += 1
            }
            xpEvents = [...s.xpEvents, ...events]

            const today = todayKey()
            const todaysFocusMinutes = sessions
              .filter((x) => x.type === 'focus' && toDateKey(x.startedAt) === today)
              .reduce((sum, x) => sum + x.actualSeconds / 60, 0)

            if (todaysFocusMinutes >= 30 && !streakDates.includes(today)) {
              streakDates = [...streakDates, today]
            }

            if (todaysFocusMinutes >= s.settings.dailyGoalMinutes) {
              const alreadyAwardedToday = s.xpEvents.some(
                (e) => e.reason === 'Tagesziel erreicht' && toDateKey(e.timestamp) === today
              )
              if (!alreadyAwardedToday) {
                xpEvents = [
                  ...xpEvents,
                  { id: uid(), amount: XP_RULES.dailyGoalReached, reason: 'Tagesziel erreicht', timestamp: Date.now() }
                ]
              }
            }
          }

          const nextState: AppState & { cycleCount: number } = {
            sessions,
            projects: s.projects,
            exams: s.exams,
            xpEvents,
            unlockedAchievements: s.unlockedAchievements,
            settings: s.settings,
            streakDates,
            cycleCount
          }

          const newlyUnlockedIds = evaluateAchievements(nextState)
          const unlockedAchievements =
            newlyUnlockedIds.length > 0
              ? [...s.unlockedAchievements, ...newlyUnlockedIds.map((id) => ({ id, unlockedAt: Date.now() }))]
              : s.unlockedAchievements

          const pendingToasts = [
            ...s.pendingToasts,
            ...newlyUnlockedIds.map((id) => ({ id: uid(), kind: 'achievement' as const, payload: id }))
          ]

          return {
            sessions,
            xpEvents,
            streakDates,
            cycleCount,
            unlockedAchievements,
            pendingToasts,
            activeSession: null
          }
        })
      },

      dismissToast: (id) => set((s) => ({ pendingToasts: s.pendingToasts.filter((t) => t.id !== id) })),
      dismissAdaptiveSuggestion: () => set({ lastAdaptiveSuggestionDismissedAt: Date.now() })
    }),
    {
      name: 'zeitmanagement-store',
      version: 1
    }
  )
)

export function totalXp(xpEvents: { amount: number }[]): number {
  return xpEvents.reduce((sum, e) => sum + e.amount, 0)
}
