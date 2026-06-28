import type { Stock } from '../../../shared/types'
import { rateColor, signed, won } from '../lib/format'
import StockChart from './StockChart'
import ConditionPanel from './ConditionPanel'
import AlertHistoryPanel from './AlertHistoryPanel'
import NewsPanel from './NewsPanel'

// 우측 상세: 시세 헤더 + 차트 + 조건 + 알림 이력
export default function DetailPanel({ stock }: { stock: Stock | null }) {
  if (!stock) {
    return (
      <main className="flex-1 grid place-items-center text-gray-400 text-sm">
        좌측에서 종목을 선택하세요
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-bold text-gray-900">{stock.name}</h2>
        <span className="text-sm text-gray-400">{stock.code}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums text-gray-900">{won(stock.price)}</span>
        <span className={`text-lg tabular-nums ${rateColor(stock.changeRate)}`}>
          {signed(stock.change)} ({signed(stock.changeRate)}%)
        </span>
      </div>
      <div className="text-sm text-gray-500">거래량 {won(stock.volume)}</div>

      <div className="grid grid-cols-1 gap-4 pt-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">차트</h3>
          <StockChart code={stock.code} />
        </section>
        <ConditionPanel stock={stock} />
        <NewsPanel code={stock.code} />
        <AlertHistoryPanel code={stock.code} />
      </div>
    </main>
  )
}
