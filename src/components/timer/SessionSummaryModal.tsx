import { Modal } from '../ui/Modal'
import type { FocusSession } from '../../types'
import { scoreLabel } from '../../lib/focusScore'
import { formatMinutes } from '../../lib/format'

interface Props {
  session: FocusSession | null
  onClose: () => void
}

export function SessionSummaryModal({ session, onClose }: Props) {
  if (!session) return null
  const isFocus = session.type === 'focus'
  const { label, color } = scoreLabel(session.focusScore ?? 0)

  return (
    <Modal open={!!session} onClose={onClose} title={isFocus ? 'Session beendet' : 'Pause beendet'}>
      <div className="text-center py-2">
        {isFocus ? (
          <>
            <div className={`text-5xl font-extrabold tabular-nums ${color}`}>{session.focusScore}</div>
            <div className="text-sm text-slate-400 mb-4">
              Fokus-Score · <span className={color}>{label}</span>
            </div>
          </>
        ) : (
          <div className="text-5xl mb-3">☕</div>
        )}

        <div className="grid grid-cols-2 gap-2 text-left">
          <InfoRow label="Dauer" value={formatMinutes(session.actualSeconds / 60)} />
          <InfoRow label="Status" value={session.completed ? 'Abgeschlossen' : 'Vorzeitig beendet'} />
          {isFocus && <InfoRow label="Pausiert" value={`${session.pauseCount}×`} />}
          {isFocus && <InfoRow label="Ablenkungen" value={`${session.distractions.length}×`} />}
        </div>

        {isFocus && (
          <div className="mt-4 text-sm text-accent font-semibold">
            +{Math.round(session.actualSeconds / 60)} XP {session.completed ? '+10 XP Bonus' : ''}
          </div>
        )}

        <button className="btn-primary w-full mt-5" onClick={onClose}>
          Weiter
        </button>
      </div>
    </Modal>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-800 rounded-xl px-3 py-2">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
