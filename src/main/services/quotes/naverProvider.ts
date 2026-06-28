import type { Quote, SearchItem, Candle, NewsItem } from '../../../shared/types'
import type { QuoteProvider } from './QuoteProvider'

const URL = 'https://polling.finance.naver.com/api/realtime/domestic/stock'
const SEARCH_URL = 'https://m.stock.naver.com/front-api/search/autoComplete'
const CHART_URL = 'https://m.stock.naver.com/api/stock'
const INTRADAY_URL = 'https://api.stock.naver.com/chart/domestic/item'
const NEWS_URL = 'https://m.stock.naver.com/api/news/stock'
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

interface NaverNewsItem {
  officeName: string
  officeId: string
  articleId: string
  datetime: string // "YYYYMMDDHHmm" KST
  title: string
  body: string
}

// "YYYYMMDDHHmm" (KST) → ISO 8601 KST "YYYY-MM-DDTHH:mm:00+09:00"
function toIso(dt: string): string {
  return `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(10, 12)}:00+09:00`
}

// 네이버 뉴스 제목/본문의 HTML 엔티티 디코딩 (React는 텍스트 엔티티를 자동 디코딩하지 않음).
// ponytail: 흔한 엔티티 + 숫자 엔티티만. 전체 디코더(he 등)는 과함.
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // amp 마지막: 이중 디코딩 방지
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
  },
  async getNews(code) {
    try {
      const res = await fetch(`${NEWS_URL}/${code}?pageSize=10&page=1`, {
        headers: { 'User-Agent': UA }
      })
      if (!res.ok) return []
      // 응답은 그룹 배열 — 모든 그룹의 items를 평탄화해 더 많은 헤드라인 노출.
      const json = (await res.json()) as { items?: NaverNewsItem[] }[]
      return json.flatMap((g) => g.items ?? []).map((n) => ({
        title: decodeEntities(n.title),
        press: n.officeName,
        summary: decodeEntities(n.body),
        datetime: toIso(n.datetime),
        url: `https://n.news.naver.com/article/${n.officeId}/${n.articleId}`
      }))
    } catch {
      return [] // 네트워크/파싱 실패가 패널을 막지 않음
    }
  }
}
