import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import type { Exam } from '../../types'
import { ProgressBar } from '../ui/ProgressBar'
import { daysUntil, formatDateHuman, formatMinutes } from '../../lib/format'
import { useConfirm } from '../../lib/confirm'

interface Props {
  exam: Exam
  onStartProject: (projectId: string) => void
}

export function ExamCard({ exam, onStartProject }: Props) {
  const sessions = useStore((s) => s.sessions)
  const deleteExam = useStore((s) => s.deleteExam)
  const confirm = useConfirm()

  const studiedMinutes = useMemo(() => {
    if (!exam.projectId) return 0
    return sessions
      .filter((s) => s.type === 'focus' && s.projectId === exam.projectId && s.startedAt >= exam.createdAt)
      .reduce((sum, s) => sum + s.actualSeconds / 60, 0)
  }, [sessions, exam])

  const goalMinutes = exam.hoursGoal * 60
  const progress = goalMinutes > 0 ? studiedMinutes / goalMinutes : 0
  const days = daysUntil(exam.date)

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Prüfung löschen?',
      message: `„${exam.subject}" wird dauerhaft entfernt. Dein bereits erfasster Lernfortschritt (Fokus-Sessions) bleibt erhalten, wird aber nicht mehr dieser Prüfung zugeordnet.`,
      confirmLabel: 'Löschen',
      danger: true
    })
    if (ok) deleteExam(exam.id)
  }

  return (
    <div className="card p-4" style={{ borderLeft: `3px solid ${exam.color}` }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="font-bold">{exam.subject}</div>
          <div className="text-xs text-slate-500">{formatDateHuman(exam.date)}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${days < 0 ? 'text-slate-500' : days <= 3 ? 'text-rose-400' : 'text-slate-200'}`}>
            {days < 0 ? 'Vorbei' : days === 0 ? 'Heute' : `Noch ${days} Tage`}
          </div>
          <button onClick={handleDelete} className="text-[11px] text-slate-500 hover:text-rose-400">
            Löschen
          </button>
        </div>
      </div>
      <div className="text-sm text-slate-400 mb-2">
        {formatMinutes(studiedMinutes)} / {exam.hoursGoal} h gelernt ({Math.round(progress * 100)}%)
      </div>
      <ProgressBar value={progress} />
      {exam.projectId ? (
        <button
          className="btn-primary w-full mt-3 text-sm py-2"
          onClick={() => onStartProject(exam.projectId!)}
        >
          📖 Jetzt für „{exam.subject}" lernen
        </button>
      ) : (
        <p className="text-[11px] text-slate-500 mt-2">
          Verknüpfe ein Projekt mit dieser Prüfung, damit Fokus-Sessions automatisch gezählt werden.
        </p>
      )}
    </div>
  )
}
