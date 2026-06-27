import type { Quote, SearchItem, Candle } from '../../../shared/types'
import type { QuoteProvider } from './QuoteProvider'

const URL = 'https://polling.finance.naver.com/api/realtime/domestic/stock'
const SEARCH_URL = 'https://m.stock.naver.com/front-api/search/autoComplete'
const CHART_URL = 'https://m.stock.naver.com/api/stock'
const INTRADAY_URL = 'https://api.stock.naver.com/chart/domestic/item'
// UA 없으면 차단됨.
const UA = 'Mozilla/5.0'

interface NaverDatas {
  closePriceRaw?: string
  compareToPreviousClosePriceRaw?: string
  fluctuationsRatioRaw?: string
  accumulatedTradingVolumeRaw?: string
}

async function fetchOne(code: string): Promise<Quote | null> {
  const res = await fetch(`${URL}/${code}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  const json = (await res.json()) as { datas?: NaverDatas[] }
  const d = json.datas?.[0]
  if (!d) return null
  return {
    code,
    price: Number(d.closePriceRaw), // Raw = 부호 포함, 콤마 없음
    change: Number(d.compareToPreviousClosePriceRaw),
    changeRate: Number(d.fluctuationsRatioRaw),
    volume: Number(d.accumulatedTradingVolumeRaw)
  }
}

interface NaverSearchItem {
  code: string
  name: string
  typeName: string
}

// ponytail: 종목당 순차 호출. N 작아 충분, 배치 엔드포인트는 느려지면.
export const naverProvider: QuoteProvider = {
  name: 'naver',
  async getQuotes(codes) {
    const out: Quote[] = []
    for (const code of codes) {
      try {
        const q = await fetchOne(code)
        if (q) out.push(q)
      } catch {
        // 한 종목 실패가 전체를 막지 않게 건너뜀
      }
    }
    return out
  },
  async search(query) {
    const q = query.trim()
    if (!q) return []
    const res = await fetch(`${SEARCH_URL}?query=${encodeURIComponent(q)}&target=stock`, {
      headers: { 'User-Agent': UA }
    })
    if (!res.ok) return []
    const json = (await res.json()) as { result?: { items?: NaverSearchItem[] } }
    return (json.result?.items ?? [])
      .slice(0, 10)
      .map((i) => ({ code: i.code, name: i.name, market: i.typeName }))
  },
  async getDailyChart(code, count) {
    const res = await fetch(`${CHART_URL}/${code}/price?pageSize=${count}&page=1`, {
      headers: { 'User-Agent': UA }
    })
    if (!res.ok) return []
    const rows = (await res.json()) as { localTradedAt: string; closePrice: string; accumulatedTradingVolume: number | string }[]
    return rows
      .map((r) => ({
        date: r.localTradedAt,
        close: Number(String(r.closePrice).replace(/,/g, '')),
        volume: Number(r.accumulatedTradingVolume)
      }))
      .reverse() // 응답은 최신순 → 과거→현재로
  },
  async getIntradayChart(code) {
    const res = await fetch(`${INTRADAY_URL}/${code}/minute?minuteUnit=5`, { headers: { 'User-Agent': UA } })
    if (!res.ok) return []
    const rows = (await res.json()) as { localDateTime: string; currentPrice: number; accumulatedTradingVolume: number }[]
    // localDateTime "YYYYMMDDHHmmss" → "HH:mm". 응답은 이미 시간순.
    return rows.map((r) => ({
      date: `${r.localDateTime.slice(8, 10)}:${r.localDateTime.slice(10, 12)}`,
      close: r.currentPrice,
      volume: r.accumulatedTradingVolume
    }))
  }
}
