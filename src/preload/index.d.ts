import type { Stock, Quote, SearchItem, Candle, Condition, NewCondition, AlertHistory, Settings, UpdateCheckResult, NewsItem } from '../shared/types'

export interface WatchlistApi {
  list(): Promise<Stock[]>
  add(item: SearchItem): Promise<Stock[]>
  remove(code: string): Promise<Stock[]>
  toggleFavorite(code: string): Promise<Stock[]>
}

export interface QuotesApi {
  onUpdate(cb: (quotes: Quote[]) => void): () => void
}

export interface SearchApi {
  stocks(query: string): Promise<SearchItem[]>
}

export interface ChartApi {
  daily(code: string, count: number): Promise<Candle[]>
  intraday(code: string): Promise<Candle[]>
}

export interface ConditionsApi {
  list(code: string): Promise<Condition[]>
  add(c: NewCondition): Promise<Condition[]>
  remove(id: number, code: string): Promise<Condition[]>
  toggle(id: number, code: string): Promise<Condition[]>
}

export interface AlertsApi {
  list(code: string): Promise<AlertHistory[]>
  onNew(cb: (entry: AlertHistory) => void): () => void
}

export interface SettingsApi {
  get(): Promise<Settings>
  set(patch: Partial<Settings>): Promise<Settings>
}

export interface WidgetApi {
  toggle(): Promise<boolean>
  isOpen(): Promise<boolean>
  openMain(code: string): Promise<void>
}

export interface MainApi {
  onSelect(cb: (code: string) => void): () => void
}

export interface NewsApi {
  list(code: string): Promise<NewsItem[]>
}

export interface AppApi {
  version(): Promise<string>
  checkForUpdates(): Promise<UpdateCheckResult>
  openExternal(url: string): Promise<void>
}

declare global {
  interface Window {
    tickly: {
      watchlist: WatchlistApi
      quotes: QuotesApi
      search: SearchApi
      chart: ChartApi
      conditions: ConditionsApi
      alerts: AlertsApi
      news: NewsApi
      settings: SettingsApi
      widget: WidgetApi
      main: MainApi
      app: AppApi
    }
  }
}
