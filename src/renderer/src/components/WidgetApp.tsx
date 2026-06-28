import { useEffect, useState } from 'react'
import type { Stock } from '../../../shared/types'
import { rateColor, signed, won } from '../lib/format'

export default function WidgetApp() {
  const [stocks, setStocks] = useState<Stock[]>([])

  // 매 시세 틱마다 목록 재조회 → 가격 + 즐겨찾기 변경 동기화 (DB엔 최신가가 이미 반영됨).
  useEffect(() => {
    const load = (): void => {
      window.tickly.watchlist.list().then(setStocks)
    }
    load()
    return window.tickly.quotes.onUpdate(load)
  }, [])

  // 위젯엔 즐겨찾기(별표)한 종목만 표시.
  const favorites = stocks.filter((s) => s.favorite)

  return (
    <div className="h-screen w-screen overflow-hidden rounded-lg bg-black/75 text-white text-xs select-none flex flex-col">
      <div className="drag-region flex items-center px-2.5 py-1.5 bg-white/10 shrink-0">
        <span className="font-semibold tracking-tight">Tickly</span>
      </div>
      {favorites.length === 0 ? (
        <div className="flex-1 grid place-items-center text-white/50 px-3 text-center">
          즐겨찾기(★)한 종목이 위젯에 표시됩니다
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {favorites.map((s) => (
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
      )}
    </div>
  )
}
