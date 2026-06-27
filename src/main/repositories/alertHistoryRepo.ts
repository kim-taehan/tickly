import type { AlertHistory } from '../../shared/types'
import { getDb } from '../database/db'

interface Row {
  id: number
  code: string
  name: string
  message: string
  price: number
  fired_at: string
}

const toAlert = (r: Row): AlertHistory => ({
  id: r.id,
  code: r.code,
  name: r.name,
  message: r.message,
  price: r.price,
  firedAt: r.fired_at
})

export function add(entry: Omit<AlertHistory, 'id'>): AlertHistory {
  const info = getDb()
    .prepare('INSERT INTO alert_history (code, name, message, price, fired_at) VALUES (@code, @name, @message, @price, @firedAt)')
    .run(entry)
  return { id: Number(info.lastInsertRowid), ...entry }
}

export function list(code: string, limit = 50): AlertHistory[] {
  return (
    getDb().prepare('SELECT * FROM alert_history WHERE code = ? ORDER BY id DESC LIMIT ?').all(code, limit) as Row[]
  ).map(toAlert)
}
