import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs'
import type { Stock, Condition, AlertHistory, Settings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/settings'
import { SEED_STOCKS } from '../../shared/stocks'

// 로컬 파일 저장소 — SQLite 대체. 데이터 규모가 작고 단일 프로세스라 파일이면 충분.
// 시작 시 1회 로드, 변경 시 원자적 저장(tmp 작성 후 rename).
interface Data {
  watchlist: Stock[]
  conditions: Condition[]
  alertHistory: AlertHistory[]
  settings: Settings
  seq: { condition: number; alert: number } // 자동증가 id
}

let data: Data | null = null
let file = ''

function defaults(): Data {
  return {
    watchlist: SEED_STOCKS.map((s) => ({ ...s })),
    conditions: [],
    alertHistory: [],
    settings: { ...DEFAULT_SETTINGS },
    seq: { condition: 0, alert: 0 }
  }
}

export function getData(): Data {
  if (data) return data
  const dir = join(app.getPath('appData'), 'tickly')
  mkdirSync(dir, { recursive: true })
  file = join(dir, 'tickly.json')
  if (existsSync(file)) {
    try {
      data = { ...defaults(), ...(JSON.parse(readFileSync(file, 'utf8')) as Partial<Data>) }
    } catch {
      data = defaults() // 손상 시 기본값 (데이터 손실보다 동작 우선)
    }
  } else {
    data = defaults()
    save()
  }
  return data
}

export function save(): void {
  if (!data) return
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2))
  renameSync(tmp, file) // 원자적 — 중간 크래시에도 파일 손상 방지
}
