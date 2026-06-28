import { useEffect, useState } from 'react'
import type { NewsItem } from '../../../shared/types'

const fmtTime = (iso: string): string => new Date(iso).toLocaleString('ko-KR', { hour12: false })

export default function NewsPanel({ code }: { code: string }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setItems([])
    window.tickly.news.list(code).then((d) => {
      if (!alive) return
      setItems(d)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [code])

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">뉴스</h3>
      {loading ? (
        <p className="text-xs text-gray-400">뉴스 로딩…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400">관련 뉴스가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.url}>
              <button
                onClick={() => window.tickly.app.openExternal(n.url)}
                className="text-left text-sm font-medium text-gray-800 hover:text-indigo-600 hover:underline"
              >
                {n.title}
              </button>
              <div className="mt-0.5 flex items-baseline gap-2 text-xs text-gray-400">
                <span>{n.press}</span>
                <span className="tabular-nums">{fmtTime(n.datetime)}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
