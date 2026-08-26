export type EnergyLevel = 'low' | 'normal' | 'high'

export type DistractionReason =
  | 'phone'
  | 'social'
  | 'gaming'
  | 'internet'
  | 'tiredness'
  | 'people'
  | 'other'

export const DISTRACTION_LABELS: Record<DistractionReason, { label: string; icon: string }> = {
  phone: { label: 'Handy', icon: '📱' },
  social: { label: 'Social Media', icon: '💬' },
  gaming: { label: 'Gaming', icon: '🎮' },
  internet: { label: 'Internet', icon: '🌐' },
  tiredness: { label: 'Müdigkeit', icon: '😴' },
  people: { label: 'Andere Personen', icon: '👥' },
  other: { label: 'Sonstiges', icon: '✏️' }
}

export interface DistractionEvent {
  id: string
  timestamp: number
  reason: DistractionReason
  note?: string
}

export type SessionType = 'focus' | 'short_break' | 'long_break'

export interface FocusSession {
  id: string
  type: SessionType
  projectId?: string
  taskLabel?: string
  plannedMinutes: number
  actualSeconds: number
  startedAt: number
  endedAt: number
  completed: boolean
  pauseCount: number
  distractions: DistractionEvent[]
  energyBefore?: EnergyLevel
  focusScore?: number
}

export interface Project {
  id: string
  name: string
  emoji: string
  color: string
  parentId?: string
  createdAt: number
  archived?: boolean
}

export interface Preset {
  id: string
  name: string
  focusMinutes: number
  breakMinutes: number
  longBreakMinutes: number
  sessionsUntilLongBreak: number
}

export interface Exam {
  id: string
  subject: string
  date: string // ISO date
  hoursGoal: number
  projectId?: string
  createdAt: number
  color: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: number
}

export interface XPEvent {
  id: string
  amount: number
  reason: string
  timestamp: number
}

export type SoundscapeId = 'none' | 'rain' | 'cafe' | 'whitenoise' | 'forest' | 'lofi'

export interface Settings {
  dailyGoalMinutes: number
  activePresetId: string
  customPresets: Preset[]
  autoStartBreaks: boolean
  autoStartFocus: boolean
  notificationsEnabled: boolean
  soundscape: SoundscapeId
  soundscapeVolume: number
  focusModeFullscreen: boolean
  focusModeMuteNotifications: boolean
  focusModeBlockReminder: boolean
  adaptiveSuggestionsEnabled: boolean
}

export interface DailyStat {
  date: string // yyyy-mm-dd
  focusMinutes: number
  sessionsCompleted: number
}

export interface AppState {
  sessions: FocusSession[]
  projects: Project[]
  exams: Exam[]
  xpEvents: XPEvent[]
  unlockedAchievements: UnlockedAchievement[]
  settings: Settings
  streakDates: string[] // yyyy-mm-dd days where daily goal of real focus time was met
  lastAdaptiveSuggestionDismissedAt?: number
}
