import type { Preset } from '../types'

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'classic', name: '25 / 5 Klassisch', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsUntilLongBreak: 4 },
  { id: 'deep', name: '50 / 10 Deep Work', focusMinutes: 50, breakMinutes: 10, longBreakMinutes: 20, sessionsUntilLongBreak: 3 },
  { id: 'sprint', name: '15 / 3 Sprint', focusMinutes: 15, breakMinutes: 3, longBreakMinutes: 10, sessionsUntilLongBreak: 4 }
]
