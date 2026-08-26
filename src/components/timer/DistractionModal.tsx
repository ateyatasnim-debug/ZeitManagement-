import { Modal } from '../ui/Modal'
import { DISTRACTION_LABELS, type DistractionReason } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (reason: DistractionReason) => void
}

export function DistractionModal({ open, onClose, onSelect }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Was hat dich abgelenkt?">
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(DISTRACTION_LABELS) as DistractionReason[]).map((key) => {
          const info = DISTRACTION_LABELS[key]
          return (
            <button
              key={key}
              onClick={() => {
                onSelect(key)
                onClose()
              }}
              className="flex items-center gap-2 px-3 py-3 rounded-xl bg-base-800 hover:bg-base-700 text-sm font-medium text-left"
            >
              <span className="text-xl">{info.icon}</span>
              {info.label}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
