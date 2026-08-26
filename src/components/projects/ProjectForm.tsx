import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useStore } from '../../store/useStore'
import type { Project } from '../../types'

const COLORS = ['#f97316', '#6366f1', '#22c55e', '#eab308', '#ec4899', '#06b6d4', '#a855f7']
const EMOJIS = ['📚', '🧮', '💻', '🩺', '🔬', '🎨', '✍️', '🏛️', '💼', '🎯']

interface Props {
  open: boolean
  onClose: () => void
  parentId?: string
  editing?: Project
}

export function ProjectForm({ open, onClose, parentId, editing }: Props) {
  const projects = useStore((s) => s.projects)
  const addProject = useStore((s) => s.addProject)
  const updateProject = useStore((s) => s.updateProject)

  const [name, setName] = useState(editing?.name ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '📚')
  const [color, setColor] = useState(editing?.color ?? COLORS[0])
  const [parent, setParent] = useState(editing?.parentId ?? parentId ?? '')

  const submit = () => {
    if (!name.trim()) return
    if (editing) {
      updateProject(editing.id, { name: name.trim(), emoji, color, parentId: parent || undefined })
    } else {
      addProject(name.trim(), emoji, color, parent || undefined)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Projekt bearbeiten' : 'Neues Projekt'}>
      <div className="space-y-4">
        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Mathematik"
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
            autoFocus
          />
        </label>

        <div>
          <div className="text-xs text-slate-400 mb-1.5">Icon</div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border ${emoji === e ? 'border-accent bg-accent/10' : 'border-white/5 bg-base-800'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

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

        <label className="text-xs text-slate-400 flex flex-col gap-1">
          Übergeordnetes Projekt (optional)
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="bg-base-800 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
          >
            <option value="">Kein übergeordnetes Projekt</option>
            {projects
              .filter((p) => p.id !== editing?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
              ))}
          </select>
        </label>

        <button className="btn-primary w-full" onClick={submit}>
          {editing ? 'Speichern' : 'Projekt erstellen'}
        </button>
      </div>
    </Modal>
  )
}
