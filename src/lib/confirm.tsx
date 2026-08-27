import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Custom in-app confirm dialog instead of window.confirm(): works
 * consistently in every context the app runs in (self-hosted, or embedded
 * in a sandboxed preview), and matches the app's own visual design.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(v: boolean) => void>()

  const confirm = useCallback<ConfirmFn>((options) => {
    setPending(options)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = (value: boolean) => {
    resolver.current?.(value)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => settle(false)} />
          <div className="relative card w-full max-w-sm p-5 animate-pop-in">
            <h2 className="text-base font-bold mb-1.5">{pending.title}</h2>
            <p className="text-sm text-slate-400 mb-5">{pending.message}</p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => settle(false)}>
                {pending.cancelLabel ?? 'Abbrechen'}
              </button>
              <button
                className={pending.danger ? 'btn bg-rose-600 text-white hover:bg-rose-500' : 'btn-primary'}
                onClick={() => settle(true)}
                autoFocus
              >
                {pending.confirmLabel ?? 'Bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
