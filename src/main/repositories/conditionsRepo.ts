import type { Condition, NewCondition } from '../../shared/types'
import { getDb } from '../database/db'

interface Row {
  id: number
  code: string
  metric: string
  operator: string
  threshold: number
  enabled: number
}

const toCondition = (r: Row): Condition => ({
  id: r.id,
  code: r.code,
  metric: r.metric as Condition['metric'],
  operator: r.operator as Condition['operator'],
  threshold: r.threshold,
  enabled: r.enabled === 1
})

export function list(code: string): Condition[] {
  return (getDb().prepare('SELECT * FROM conditions WHERE code = ? ORDER BY id').all(code) as Row[]).map(toCondition)
}

export function add(c: NewCondition): Condition[] {
  getDb()
    .prepare(
      'INSERT INTO conditions (code, metric, operator, threshold, enabled) VALUES (@code, @metric, @operator, @threshold, @enabled)'
    )
    .run({ ...c, enabled: c.enabled ? 1 : 0 })
  return list(c.code)
}

export function remove(id: number, code: string): Condition[] {
  getDb().prepare('DELETE FROM conditions WHERE id = ?').run(id)
  return list(code)
}

export function toggle(id: number, code: string): Condition[] {
  getDb().prepare('UPDATE conditions SET enabled = 1 - enabled WHERE id = ?').run(id)
  return list(code)
}
