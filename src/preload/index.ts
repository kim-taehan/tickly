import { contextBridge, ipcRenderer } from 'electron'
import type { Stock, Quote, SearchItem, Candle, Condition, NewCondition, AlertHistory, Settings, UpdateCheckResult, NewsItem } from '../shared/types'

const watchlist = {
  list: (): Promise<Stock[]> => ipcRenderer.invoke('watchlist:list'),
  add: (item: SearchItem): Promise<Stock[]> => ipcRenderer.invoke('watchlist:add', item),
  remove: (code: string): Promise<Stock[]> => ipcRenderer.invoke('watchlist:remove', code),
  toggleFavorite: (code: string): Promise<Stock[]> => ipcRenderer.invoke('watchlist:toggleFavorite', code)
}

const search = {
  stocks: (query: string): Promise<SearchItem[]> => ipcRenderer.invoke('search:stocks', query)
}

const chart = {
  daily: (code: string, count: number): Promise<Candle[]> => ipcRenderer.invoke('chart:daily', code, count),
  intraday: (code: string): Promise<Candle[]> => ipcRenderer.invoke('chart:intraday', code)
}

const conditions = {
  list: (code: string): Promise<Condition[]> => ipcRenderer.invoke('conditions:list', code),
  add: (c: NewCondition): Promise<Condition[]> => ipcRenderer.invoke('conditions:add', c),
  remove: (id: number, code: string): Promise<Condition[]> => ipcRenderer.invoke('conditions:remove', id, code),
  toggle: (id: number, code: string): Promise<Condition[]> => ipcRenderer.invoke('conditions:toggle', id, code)
}

const settings = {
  get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
  set: (patch: Partial<Settings>): Promise<Settings> => ipcRenderer.invoke('settings:set', patch)
}

const widget = {
  toggle: (): Promise<boolean> => ipcRenderer.invoke('widget:toggle'),
  isOpen: (): Promise<boolean> => ipcRenderer.invoke('widget:isOpen'),
  openMain: (code: string): Promise<void> => ipcRenderer.invoke('widget:openMain', code)
}

const news = {
  list: (code: string): Promise<NewsItem[]> => ipcRenderer.invoke('news:list', code)
}

const appApi = {
  version: (): Promise<string> => ipcRenderer.invoke('app:version'),
  checkForUpdates: (): Promise<UpdateCheckResult> => ipcRenderer.invoke('app:checkForUpdates'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('app:openExternal', url)
}

// 위젯에서 종목 클릭 시 메인이 받는 선택 신호
const main = {
  onSelect: (cb: (code: string) => void): (() => void) => {
    const listener = (_e: unknown, code: string): void => cb(code)
    ipcRenderer.on('main:select', listener)
    return () => ipcRenderer.removeListener('main:select', listener)
  }
}

const alerts = {
  list: (code: string): Promise<AlertHistory[]> => ipcRenderer.invoke('alerts:list', code),
  onNew: (cb: (entry: AlertHistory) => void): (() => void) => {
    const listener = (_e: unknown, entry: AlertHistory): void => cb(entry)
    ipcRenderer.on('alerts:new', listener)
    return () => ipcRenderer.removeListener('alerts:new', listener)
  }
}

// 주기적 시세 푸시 구독. 반환된 함수로 해제.
const quotes = {
  onUpdate: (cb: (quotes: Quote[]) => void): (() => void) => {
    const listener = (_e: unknown, q: Quote[]): void => cb(q)
    ipcRenderer.on('quotes:update', listener)
    return () => ipcRenderer.removeListener('quotes:update', listener)
  }
}

// 각 mutation은 갱신된 전체 목록을 반환 → 렌더러는 상태만 교체.
contextBridge.exposeInMainWorld('tickly', { watchlist, quotes, search, chart, conditions, alerts, news, settings, widget, main, app: appApi })
