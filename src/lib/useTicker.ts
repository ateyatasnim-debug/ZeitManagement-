import { useEffect, useState } from 'react'

/** Forces a re-render every `intervalMs` while `active` is true. */
export function useTicker(active: boolean, intervalMs = 250) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [active, intervalMs])
}
