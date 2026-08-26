import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ExamCard } from './ExamCard'
import { ExamForm } from './ExamForm'
import { StudyPlanGenerator } from './StudyPlanGenerator'

export function StudyView() {
  const exams = useStore((s) => s.exams)
  const [formOpen, setFormOpen] = useState(false)

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">🧑‍🎓 Study Mode</h1>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>+ Prüfung</button>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          Noch keine Prüfung geplant. Lege eine an, z. B. „Mathematik-Prüfung“ am 15.09. mit 60 Stunden Lernziel.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((e) => (
            <ExamCard key={e.id} exam={e} />
          ))}
        </div>
      )}

      <StudyPlanGenerator />

      <ExamForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
