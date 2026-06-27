import type { BrowserWindow } from 'electron'
import * as repo from '../repositories/watchlistRepo'
import * as settingsRepo from '../repositories/settingsRepo'
import { getProvider } from './quotes'
import { evaluateAndNotify } from './alertService'
import log from './logger'

let timer: ReturnType<typeof setInterval> | null = null
let currentWin: BrowserWindow | null = null

export function startQuoteScheduler(win: BrowserWindow, intervalMs = settingsRepo.get().intervalMs): void {
  stopQuoteScheduler()
  currentWin = win

  const tick = async (): Promise<void> => {
    const stocks = repo.list()
    if (stocks.length === 0) return
    const provider = getProvider()
    try {
      const quotes = await provider.getQuotes(stocks.map((s) => s.code))
      log.info(`[quotes] ${provider.name} fetched ${quotes.length}/${stocks.length}`)
      if (quotes.length === 0) return
      repo.updateQuotes(quotes)
      if (!win.isDestroyed()) win.webContents.send('quotes:update', quotes)
      evaluateAndNotify(stocks, quotes, win)
    } catch (err) {
      log.error('[quotes] tick failed', err)
    }
  }

  void tick() // 시작 즉시 1회
  timer = setInterval(() => void tick(), intervalMs)
}

export function stopQuoteScheduler(): void {
  if (timer) clearInterval(timer)
  timer = null
}

// 설정에서 주기 변경 시 즉시 재적용
export function restartScheduler(): void {
  if (currentWin) startQuoteScheduler(currentWin)
}
