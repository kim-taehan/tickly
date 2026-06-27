import { useEffect, useMemo, useState } from 'react'
import { Search, Settings, MonitorSmartphone, Plus } from 'lucide-react'
import type { Stock, SearchItem } from '../../../shared/types'
import SettingsModal from './SettingsModal'

interface Props {
  stocks: Stock[]
  onAdd: (item: SearchItem) => void
}

export default function TopBar({ stocks, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<SearchItem[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [widgetOn, setWidgetOn] = useState(false)

  useEffect(() => {
    window.tickly.widget.isOpen().then(setWidgetOn)
  }, [])
  const owned = useMemo(() => new Set(stocks.map((s) => s.code)), [stocks])

  // 디바운스 250ms 후 Naver 검색 → 보유 종목 제외
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setMatches([])
      return
    }
    const t = setTimeout(async () => {
      const items = await window.tickly.search.stocks(q)
      setMatches(items.filter((i) => !owned.has(i.code)).slice(0, 8))
    }, 250)
    return () => clearTimeout(t)
  }, [query, owned])

  const pick = (item: SearchItem): void => {
    onAdd(item)
    setQuery('')
    setMatches([])
  }

  return (
    <header className="h-12 shrink-0 border-b border-gray-200 flex items-center gap-3 px-4 bg-white relative z-10">
      <span className="font-bold text-gray-900">Tickly</span>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목 검색 (이름 또는 코드)"
          className="w-full h-8 pl-8 pr-3 rounded-md border border-gray-200 bg-gray-50 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {matches.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
            {matches.map((s) => (
              <li key={s.code}>
                <button
                  onClick={() => pick(s)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <Plus className="size-3.5 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.code}</span>
                  <span className="ml-auto text-xs text-gray-300">{s.market}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1" />
      <button
        onClick={() => window.tickly.widget.toggle().then(setWidgetOn)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-sm ${
          widgetOn ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <MonitorSmartphone className="size-4" /> 위젯
      </button>
      <button
        onClick={() => setSettingsOpen(true)}
        className="flex items-center justify-center size-8 rounded-md text-gray-700 hover:bg-gray-100"
        aria-label="설정"
      >
        <Settings className="size-4" />
      </button>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  )
}
