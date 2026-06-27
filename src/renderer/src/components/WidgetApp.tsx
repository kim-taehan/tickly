import { useEffect, useState } from 'react'
import type { Stock } from '../../../shared/types'
import { rateColor, signed, won } from '../lib/format'

export default function WidgetApp() {
  const [stocks, setStocks] = useState<Stock[]>([])

  useEffect(() => {
    window.tickly.watchlist.list().then(setStocks)
  }, [])

  useEffect(() => {
    return window.tickly.quotes.onUpdate((quotes) => {
      setStocks((prev) =>
        prev.map((s) => {
          const q = quotes.find((x) => x.code === s.code)
          return q ? { ...s, ...q } : s
        })
      )
    })
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden rounded-lg bg-black/75 text-white text-xs select-none flex flex-col">
      <div className="drag-region flex items-center px-2.5 py-1.5 bg-white/10 shrink-0">
        <span className="font-semibold tracking-tight">Tickly</span>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {stocks.map((s) => (
          <li key={s.code}>
            <button
              onClick={() => window.tickly.widget.openMain(s.code)}
              className="no-drag w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/10"
            >
              <span className="flex-1 truncate text-left">{s.name}</span>
              <span className="tabular-nums">{won(s.price)}</span>
              <span className={`tabular-nums w-14 text-right ${rateColor(s.changeRate)}`}>
                {signed(s.changeRate)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
