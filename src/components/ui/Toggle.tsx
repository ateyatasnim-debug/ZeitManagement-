interface Props {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function Toggle({ label, description, checked, onChange }: Props) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="pr-4">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 transition ${
          checked ? 'bg-accent justify-end' : 'bg-base-700 justify-start'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white block" />
      </button>
    </div>
  )
}
