import type { Settings } from '../../shared/types'
import { getData, save } from '../database/store'

export function get(): Settings {
  return getData().settings
}

export function set(patch: Partial<Settings>): Settings {
  const d = getData()
  d.settings = { ...d.settings, ...patch }
  save()
  return d.settings
}
