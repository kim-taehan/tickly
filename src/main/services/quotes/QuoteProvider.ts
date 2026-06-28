import type { Quote, SearchItem, Candle, NewsItem } from '../../../shared/types'

// 시세 공급자 전략. 구현이 둘(Naver, KIS) 이상이라 인터페이스가 정당함.
export interface QuoteProvider {
  readonly name: string
  getQuotes(codes: string[]): Promise<Quote[]>
  search(query: string): Promise<SearchItem[]>
  getDailyChart(code: string, count: number): Promise<Candle[]>
  getIntradayChart(code: string): Promise<Candle[]> // 당일(직전 거래일) 분봉
  getNews(code: string): Promise<NewsItem[]> // 종목 관련 뉴스 (최신 10건)
}
