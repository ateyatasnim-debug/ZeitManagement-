import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { computeAdaptiveSuggestion } from '../../lib/insights'

export function AdaptiveSuggestionBanner() {
  const state = useStore((s) => s)
  const addCustomPreset = useStore((s) => s.addCustomPreset)
  const updateSettings = useStore((s) => s.updateSettings)
  const dismiss = useStore((s) => s.dismissAdaptiveSuggestion)

  const suggestion = useMemo(() => {
    if (!state.settings.adaptiveSuggestionsEnabled) return null
    if (state.lastAdaptiveSuggestionDismissedAt && Date.now() - state.lastAdaptiveSuggestionDismissedAt < 86400000 * 3) {
      return null
    }
    return computeAdaptiveSuggestion(state)
  }, [state])

  if (!suggestion) return null

  const apply = () => {
    const name = `${suggestion.suggestedFocusMinutes} / ${suggestion.suggestedBreakMinutes} adaptiv`
    addCustomPreset(name, suggestion.suggestedFocusMinutes, suggestion.suggestedBreakMinutes, suggestion.suggestedBreakMinutes * 2)
    setTimeout(() => {
      const created = useStore.getState().settings.customPresets.find((p) => p.name === name)
      if (created) updateSettings({ activePresetId: created.id })
    }, 0)
    dismiss()
  }

  return (
    <div className="card p-4 border-focus/30 bg-focus/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🧠</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-1">Adaptiver Vorschlag</div>
          <p className="text-sm text-slate-400 mb-3">
            Du scheinst mit <strong className="text-slate-200">{suggestion.suggestedFocusMinutes} Minuten</strong>{' '}
            besser zu arbeiten. {suggestion.reason}
          </p>
          <div className="flex gap-2">
            <button className="btn-primary text-sm py-1.5 px-3" onClick={apply}>
              {suggestion.suggestedFocusMinutes}/{suggestion.suggestedBreakMinutes} ausprobieren
            </button>
            <button className="btn-ghost text-sm py-1.5 px-3" onClick={dismiss}>
              Später
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
