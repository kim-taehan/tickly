import { Star, X } from 'lucide-react'
import type { Stock } from '../../../shared/types'
import { rateColor, signed, won } from '../lib/format'

interface Props {
  stocks: Stock[]
  selectedCode: string | null
  onSelect: (code: string) => void
  onToggleFavorite: (code: string) => void
  onRemove: (code: string) => void
}

export default function Watchlist({ stocks, selectedCode, onSelect, onToggleFavorite, onRemove }: Props) {
  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-white border-b border-gray-100">
        관심 종목 ({stocks.length})
      </div>
      <ul>
        {stocks.map((s) => (
          <li
            key={s.code}
            onClick={() => onSelect(s.code)}
            className={`group px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${
              s.code === selectedCode ? 'bg-blue-50' : ''
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(s.code)
              }}
              aria-label="즐겨찾기"
              className="shrink-0"
            >
              <Star className={`size-3.5 ${s.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
              <div className="text-xs text-gray-400">{s.code}</div>
            </div>
            <div className="text-right">
              <div className="text-sm tabular-nums text-gray-900">{won(s.price)}</div>
              <div className={`text-xs tabular-nums ${rateColor(s.changeRate)}`}>{signed(s.changeRate)}%</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(s.code)
              }}
              aria-label="삭제"
              className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
