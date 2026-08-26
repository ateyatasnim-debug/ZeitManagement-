export interface GrowthStage {
  emoji: string
  label: string
}

const STAGES: GrowthStage[] = [
  { emoji: '🌰', label: 'Samen' },
  { emoji: '🌱', label: 'Keimling' },
  { emoji: '🌿', label: 'Sprössling' },
  { emoji: '🪴', label: 'Junge Pflanze' },
  { emoji: '🌳', label: 'Baum' },
  { emoji: '🌳✨', label: 'Prachtbaum' }
]

/** Stage derived from minutes of uninterrupted focus accumulated in the running session chain. */
export function stageForMinutes(minutes: number): GrowthStage {
  if (minutes >= 600) return STAGES[5]
  if (minutes >= 240) return STAGES[4]
  if (minutes >= 90) return STAGES[3]
  if (minutes >= 45) return STAGES[2]
  if (minutes >= 15) return STAGES[1]
  return STAGES[0]
}

export function nextStageAt(minutes: number): number | null {
  const thresholds = [15, 45, 90, 240, 600]
  for (const t of thresholds) {
    if (minutes < t) return t
  }
  return null
}
