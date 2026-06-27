import { useEffect, useState } from 'react'
import type { AlertHistory } from '../../../shared/types'

const fmtTime = (iso: string): string => new Date(iso).toLocaleString('ko-KR', { hour12: false })

export default function AlertHistoryPanel({ code }: { code: string }) {
  const [items, setItems] = useState<AlertHistory[]>([])

  useEffect(() => {
    window.tickly.alerts.list(code).then(setItems)
  }, [code])

  // 새 알림 푸시 → 현재 보는 종목이면 맨 위에 추가
  useEffect(() => {
    return window.tickly.alerts.onNew((entry) => {
      if (entry.code === code) setItems((prev) => [entry, ...prev])
    })
  }, [code])

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">알림 이력</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">알림 이력이 없습니다.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((a) => (
            <li key={a.id} className="text-sm flex items-baseline gap-2">
              <span className="text-xs text-gray-400 tabular-nums shrink-0">{fmtTime(a.firedAt)}</span>
              <span className="text-gray-700">{a.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
