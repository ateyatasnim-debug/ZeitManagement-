import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { ProjectForm } from './ProjectForm'
import type { Project } from '../../types'
import { formatMinutes, startOfWeek, toDateKey } from '../../lib/format'
import { useConfirm } from '../../lib/confirm'

export function ProjectsView() {
  const projects = useStore((s) => s.projects)
  const sessions = useStore((s) => s.sessions)
  const deleteProject = useStore((s) => s.deleteProject)
  const confirm = useConfirm()
  const [formOpen, setFormOpen] = useState(false)
  const [formParent, setFormParent] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState<Project | undefined>(undefined)

  const minutesById = useMemo(() => {
    const weekStart = startOfWeek().getTime()
    const totals = new Map<string, { total: number; week: number }>()
    for (const s of sessions) {
      if (s.type !== 'focus' || !s.projectId) continue
      const entry = totals.get(s.projectId) ?? { total: 0, week: 0 }
      entry.total += s.actualSeconds / 60
      if (s.startedAt >= weekStart) entry.week += s.actualSeconds / 60
      totals.set(s.projectId, entry)
    }
    return totals
  }, [sessions])

  const roots = projects.filter((p) => !p.parentId)
  const childrenOf = (id: string) => projects.filter((p) => p.parentId === id)

  const openCreate = (parentId?: string) => {
    setEditing(undefined)
    setFormParent(parentId)
    setFormOpen(true)
  }
  const openEdit = (p: Project) => {
    setEditing(p)
    setFormParent(undefined)
    setFormOpen(true)
  }

  const handleDelete = async (p: Project) => {
    const children = childrenOf(p.id)
    const ok = await confirm({
      title: 'Projekt löschen?',
      message:
        children.length > 0
          ? `„${p.name}" und ${children.length} Unterprojekt(e) werden dauerhaft gelöscht. Bereits erfasste Fokus-Sessions bleiben in der Statistik erhalten.`
          : `„${p.name}" wird dauerhaft gelöscht. Bereits erfasste Fokus-Sessions bleiben in der Statistik erhalten.`,
      confirmLabel: 'Löschen',
      danger: true
    })
    if (ok) deleteProject(p.id)
  }

  const renderProject = (p: Project, depth: number) => {
    const stats = minutesById.get(p.id) ?? { total: 0, week: 0 }
    const children = childrenOf(p.id)
    return (
      <div key={p.id}>
        <div
          className="card p-3.5 flex items-center gap-3"
          style={{ marginLeft: depth * 20, borderLeft: `3px solid ${p.color}` }}
        >
          <span className="text-2xl">{p.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{p.name}</div>
            <div className="text-xs text-slate-500">
              {formatMinutes(stats.week)} diese Woche · {formatMinutes(stats.total)} gesamt
            </div>
          </div>
          <button onClick={() => openCreate(p.id)} className="text-xs text-slate-400 hover:text-accent px-2">+ Unterprojekt</button>
          <button onClick={() => openEdit(p)} className="text-xs text-slate-400 hover:text-accent px-2">Bearbeiten</button>
          <button onClick={() => handleDelete(p)} className="text-xs text-slate-500 hover:text-rose-400 px-2">Löschen</button>
        </div>
        {children.map((c) => renderProject(c, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">📚 Projekte</h1>
        <button className="btn-primary" onClick={() => openCreate(undefined)}>+ Neues Projekt</button>
      </div>

      {roots.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          Noch keine Projekte. Lege z. B. „Studium“ an und darunter „Mathematik“, „Programmieren“ etc.
        </div>
      ) : (
        <div className="space-y-2">{roots.map((p) => renderProject(p, 0))}</div>
      )}

      <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} parentId={formParent} editing={editing} />
    </div>
  )
}
