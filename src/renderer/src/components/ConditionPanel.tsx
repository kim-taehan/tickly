import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Stock, Condition, Metric, Operator } from '../../../shared/types'
import { isConditionMet, conditionLabel, METRIC_LABELS, OPERATOR_LABELS } from '../../../shared/conditions'

export default function ConditionPanel({ stock }: { stock: Stock }) {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [metric, setMetric] = useState<Metric>('price')
  const [operator, setOperator] = useState<Operator>('gte')
  const [threshold, setThreshold] = useState('')

  useEffect(() => {
    window.tickly.conditions.list(stock.code).then(setConditions)
  }, [stock.code])

  // 현재가 선택 시 현재 금액으로 prefill (종목/지표 바뀔 때만 — 시세 틱엔 안 건드림)
  useEffect(() => {
    setThreshold(metric === 'price' ? String(stock.price) : '')
  }, [metric, stock.code])

  const submit = (e: React.FormEvent): void => {
    e.preventDefault()
    const value = Number(threshold)
    if (!Number.isFinite(value)) return
    window.tickly.conditions
      .add({ code: stock.code, metric, operator, threshold: value, enabled: true })
      .then(setConditions)
    setThreshold('')
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">조건</h3>

      <form onSubmit={submit} className="flex gap-2 mb-3">
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white"
        >
          {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
            <option key={m} value={m}>
              {METRIC_LABELS[m]}
            </option>
          ))}
        </select>
        <input
          type="number"
          step={metric === 'price' ? 500 : 'any'}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="값"
          className="h-8 w-28 px-2 rounded-md border border-gray-200 text-sm tabular-nums"
        />
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as Operator)}
          className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white"
        >
          {(Object.keys(OPERATOR_LABELS) as Operator[]).map((o) => (
            <option key={o} value={o}>
              {OPERATOR_LABELS[o]}
            </option>
          ))}
        </select>
        <button type="submit" className="h-8 px-3 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">
          추가
        </button>
      </form>

      {conditions.length === 0 ? (
        <p className="text-xs text-gray-400">등록된 조건이 없습니다.</p>
      ) : (
        <ul className="space-y-1.5">
          {conditions.map((c) => {
            const met = c.enabled && isConditionMet(stock, c)
            return (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={() => window.tickly.conditions.toggle(c.id, stock.code).then(setConditions)}
                  className="size-4"
                />
                <span className={c.enabled ? 'text-gray-800' : 'text-gray-400 line-through'}>{conditionLabel(c)}</span>
                {met && (
                  <span className="text-xs font-medium text-white bg-red-500 rounded px-1.5 py-0.5">충족</span>
                )}
                <button
                  onClick={() => window.tickly.conditions.remove(c.id, stock.code).then(setConditions)}
                  aria-label="조건 삭제"
                  className="ml-auto text-gray-300 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
