import type { Settings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/settings'
import { getDb } from '../database/db'

const KEY = 'app'

// ponytail: 설정 전체를 JSON 한 행으로 저장. 항목 적어 KV 칸칸이 불필요.
export function get(): Settings {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(KEY) as { value: string } | undefined
  if (!row) return DEFAULT_SETTINGS
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function set(patch: Partial<Settings>): Settings {
  const next = { ...get(), ...patch }
  getDb()
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(KEY, JSON.stringify(next))
  return next
}
