import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  intervalMs: 10_000,
  alertsEnabled: true
}

export const INTERVAL_OPTIONS = [5_000, 10_000, 30_000, 60_000] as const

export const intervalLabel = (ms: number): string => (ms < 60_000 ? `${ms / 1000}초` : `${ms / 60_000}분`)
