import type { AlertHistory } from '../../shared/types'
import { getData, save } from '../database/store'

export function add(entry: Omit<AlertHistory, 'id'>): AlertHistory {
  const d = getData()
  const e: AlertHistory = { id: ++d.seq.alert, ...entry }
  d.alertHistory.push(e)
  save()
  return e
}

export function list(code: string, limit = 50): AlertHistory[] {
  // 최신순, 최대 limit건
  return getData()
    .alertHistory.filter((a) => a.code === code)
    .slice(-limit)
    .reverse()
}
