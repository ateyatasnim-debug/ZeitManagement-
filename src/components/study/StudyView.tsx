import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ExamCard } from './ExamCard'
import { ExamForm } from './ExamForm'
import { StudyPlanGenerator } from './StudyPlanGenerator'

interface Props {
  onStartProject: (projectId: string) => void
}

export function StudyView({ onStartProject }: Props) {
  const exams = useStore((s) => s.exams)
  const [formOpen, setFormOpen] = useState(false)

  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">🧑‍🎓 Study Mode</h1>
        <button className="btn-primary" onClick={() => setFormOpen(true)}>+ Prüfung</button>
      </div>

      <div className="card p-4 text-sm text-slate-400 leading-relaxed">
        <strong className="text-slate-200">Wofür ist das?</strong> Trage eine bevorstehende Prüfung mit einem
        Lernziel in Stunden ein und verknüpfe sie mit einem Projekt (z. B. „Mathematik“). Jede Fokus-Session, die du
        für dieses Projekt im Timer startest, zählt dann automatisch zu deinem Lernfortschritt für diese Prüfung –
        du siehst auf einen Blick, wie viel du schon geschafft hast und wie viele Tage dir bleiben.
      </div>

      {sorted.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          Noch keine Prüfung geplant. Lege eine an, z. B. „Mathematik-Prüfung“ am 15.09. mit 60 Stunden Lernziel –
          idealerweise verknüpft mit einem Projekt, damit der Fortschritt automatisch mitgezählt wird.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((e) => (
            <ExamCard key={e.id} exam={e} onStartProject={onStartProject} />
          ))}
        </div>
      )}

      <StudyPlanGenerator />

      <ExamForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
