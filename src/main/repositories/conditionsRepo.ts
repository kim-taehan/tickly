import type { Condition, NewCondition } from '../../shared/types'
import { getData, save } from '../database/store'

export function list(code: string): Condition[] {
  return getData().conditions.filter((c) => c.code === code)
}

export function add(c: NewCondition): Condition[] {
  const d = getData()
  d.conditions.push({ ...c, id: ++d.seq.condition })
  save()
  return list(c.code)
}

export function remove(id: number, code: string): Condition[] {
  const d = getData()
  d.conditions = d.conditions.filter((c) => c.id !== id)
  save()
  return list(code)
}

export function toggle(id: number, code: string): Condition[] {
  const d = getData()
  const c = d.conditions.find((x) => x.id === id)
  if (c) {
    c.enabled = !c.enabled
    save()
  }
  return list(code)
}
