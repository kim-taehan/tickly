import { useEffect, useState } from 'react'
import type { Stock, SearchItem, AlertHistory } from '../../shared/types'
import TopBar from './components/TopBar'
import Watchlist from './components/Watchlist'
import DetailPanel from './components/DetailPanel'
import AlertToasts from './components/AlertToasts'

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [toasts, setToasts] = useState<AlertHistory[]>([])

  // 최초 로드: DB에서 관심종목 조회
  useEffect(() => {
    window.tickly.watchlist.list().then(setStocks)
  }, [])

  // 제목창에 버전 표시: "Tickly (0.0.3)"
  useEffect(() => {
    window.tickly.app.version().then((v) => {
      document.title = `Tickly (${v})`
    })
  }, [])

  // 위젯에서 종목 클릭 → 메인이 해당 종목 선택
  useEffect(() => {
    return window.tickly.main.onSelect(setSelectedCode)
  }, [])

  // 새 알림 → 닫기 전엔 유지되는 인앱 배너에 추가
  useEffect(() => {
    return window.tickly.alerts.onNew((entry) => setToasts((prev) => [entry, ...prev]))
  }, [])

  // 주기적 시세 푸시 → code로 매칭해 가격 필드만 갱신
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

  const selected = stocks.find((s) => s.code === selectedCode) ?? null

  const add = (item: SearchItem) => window.tickly.watchlist.add(item).then(setStocks)
  const toggleFavorite = (code: string) => window.tickly.watchlist.toggleFavorite(code).then(setStocks)
  const remove = (code: string) =>
    window.tickly.watchlist.remove(code).then((list) => {
      setStocks(list)
      if (code === selectedCode) setSelectedCode(null)
    })

  return (
    <div className="h-screen flex flex-col text-gray-900">
      <TopBar stocks={stocks} onAdd={add} />
      <div className="flex-1 flex min-h-0">
        <Watchlist
          stocks={stocks}
          selectedCode={selectedCode}
          onSelect={setSelectedCode}
          onToggleFavorite={toggleFavorite}
          onRemove={remove}
        />
        <DetailPanel stock={selected} />
      </div>
      <AlertToasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  )
}
