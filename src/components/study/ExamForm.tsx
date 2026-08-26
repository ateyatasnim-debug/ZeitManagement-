import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useStore } from '../../store/useStore'
import { todayKey } from '../../lib/format'

const COLORS = ['#f97316', '#6366f1', '#22c55e', '#eab308', '#ec4899', '#06b6d4', '#a855f7']

interface Props {
  open: boolean
  onClose: () => void
}

export function ExamForm({ open, onClose }: Props) {
  const projects = useStore((s) => s.projects)
  const addExam = useStore((s) => s.addExam)

  const [subject, setSubject] = useState('')
  const [date, setDate] = useState(todayKey())
  const [hoursGoal, setHoursGoal] = useState(20)
  const [projectId, setProjectId] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const submit = () => {
    if (!subject.trim()) return
    addExam(subject.trim(), date, hoursGoal, color, projectId || undefined)
    setSubject('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Neue Prüfung">
      <div className="space-y-4">
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Fach / Prüfung
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="z. B. Mathematik-Prüfung"
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
            autoFocus
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-400 flex flex-col gap-1">
            Datum
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
            />
          </label>
          <label className="text-xs text-slate-400 flex flex-col gap-1">
            Lernziel (Stunden)
            <input
              type="number"
              min={1}
              value={hoursGoal}
              onChange={(e) => setHoursGoal(Number(e.target.value))}
              className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
            />
          </label>
        </div>
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Verknüpftes Projekt (empfohlen, für Fortschritt)
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          >
            <option value="">Kein Projekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
            ))}
          </select>
        </label>
        <div>
          <div className="text-xs text-slate-400 mb-1.5">Farbe</div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }}
              />
            ))}
          </div>
        </div>
        <button className="btn-primary w-full" onClick={submit}>Prüfung anlegen</button>
      </div>
    </Modal>
  )
}
