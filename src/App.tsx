import { useState } from 'react'
import { TimerView } from './components/timer/TimerView'
import { StatsView } from './components/stats/StatsView'
import { ProjectsView } from './components/projects/ProjectsView'
import { StudyView } from './components/study/StudyView'
import { AchievementsView } from './components/gamification/AchievementsView'
import { SettingsView } from './components/settings/SettingsView'
import { FocusModeOverlay } from './components/focusmode/FocusModeOverlay'
import { AchievementToaster } from './components/gamification/AchievementToaster'
import { useStore } from './store/useStore'
import { ConfirmProvider } from './lib/confirm'

type Tab = 'timer' | 'stats' | 'projects' | 'study' | 'achievements' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'timer', label: 'Timer', icon: '⏱️' },
  { id: 'stats', label: 'Statistik', icon: '📊' },
  { id: 'projects', label: 'Projekte', icon: '📚' },
  { id: 'study', label: 'Study Mode', icon: '🧑‍🎓' },
  { id: 'achievements', label: 'Erfolge', icon: '🏆' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' }
]

export default function App() {
  const [tab, setTab] = useState<Tab>('timer')
  const [focusModeOpen, setFocusModeOpen] = useState(false)
  const [prefillProjectId, setPrefillProjectId] = useState<string | undefined>(undefined)
  const activeSession = useStore((s) => s.activeSession)

  const startStudyingProject = (projectId: string) => {
    setPrefillProjectId(projectId)
    setTab('timer')
  }

  return (
    <ConfirmProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <aside className="hidden md:flex md:w-60 lg:w-64 flex-col shrink-0 border-r border-white/5 bg-base-900/60 p-4 gap-1">
          <div className="flex items-center gap-2 px-2 py-3 mb-2">
            <span className="text-2xl">🚀</span>
            <span className="font-extrabold text-lg tracking-tight">FocusFlow</span>
          </div>
          {TABS.map((t) => (
            <NavButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
          ))}
          <div className="mt-auto px-2 py-3 text-xs text-slate-500">
            Läuft lokal auf diesem Gerät · keine Cloud
          </div>
        </aside>

        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-base-900/80 sticky top-0 z-30">
          <span className="text-xl">🚀</span>
          <span className="font-extrabold tracking-tight">FocusFlow</span>
        </header>

        <main className="flex-1 min-w-0 pb-24 md:pb-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6">
            {tab === 'timer' && (
              <TimerView
                onEnterFocusMode={() => setFocusModeOpen(true)}
                prefillProjectId={prefillProjectId}
                onPrefillConsumed={() => setPrefillProjectId(undefined)}
              />
            )}
            {tab === 'stats' && <StatsView />}
            {tab === 'projects' && <ProjectsView />}
            {tab === 'study' && <StudyView onStartProject={startStudyingProject} />}
            {tab === 'achievements' && <AchievementsView />}
            {tab === 'settings' && <SettingsView />}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-base-900/95 border-t border-white/5 backdrop-blur px-1 pt-1 pb-[env(safe-area-inset-bottom)]">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[64px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-[11px] font-medium ${
                  tab === t.id ? 'text-accent' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {focusModeOpen && activeSession?.type === 'focus' && (
          <FocusModeOverlay onClose={() => setFocusModeOpen(false)} />
        )}

        <AchievementToaster />
      </div>
    </ConfirmProvider>
  )
}

function NavButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active ? 'bg-accent/15 text-accent' : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  )
}
