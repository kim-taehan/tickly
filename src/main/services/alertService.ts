import { Notification, type BrowserWindow } from 'electron'
import type { Stock, Quote, Condition } from '../../shared/types'
import { isConditionMet, conditionLabel } from '../../shared/conditions'
import * as conditionsRepo from '../repositories/conditionsRepo'
import * as historyRepo from '../repositories/alertHistoryRepo'
import * as settingsRepo from '../repositories/settingsRepo'
import log from './logger'

// 조건 id별 직전 충족 여부. 상승엣지(미충족→충족)에서만 발화 = 중복방지.
// ponytail: 메모리 맵. 삭제된 조건 키는 잔류하나 무해, 프로세스 생명주기 동안만.
const lastMet = new Map<number, boolean>()

export function evaluateAndNotify(stocks: Stock[], quotes: Quote[], win: BrowserWindow): void {
  if (!settingsRepo.get().alertsEnabled) return // 알림 전역 OFF
  for (const quote of quotes) {
    const stock = stocks.find((s) => s.code === quote.code)
    if (!stock) continue
    for (const c of conditionsRepo.list(quote.code)) {
      if (!c.enabled) continue
      const met = isConditionMet(quote, c)
      const was = lastMet.get(c.id) ?? false
      if (met && !was) fire(stock, c, quote, win)
      lastMet.set(c.id, met)
    }
  }
}

function fire(stock: Stock, c: Condition, quote: Quote, win: BrowserWindow): void {
  const current = quote[c.metric].toLocaleString('ko-KR')
  const message = `${conditionLabel(c)} 충족 (현재 ${current})`

  const entry = historyRepo.add({
    code: stock.code,
    name: stock.name,
    message,
    price: quote.price,
    firedAt: new Date().toISOString()
  })
  log.info(`[alert] ${stock.name}(${stock.code}) ${message}`)

  if (Notification.isSupported()) {
    const n = new Notification({ title: stock.name, body: message })
    n.on('click', () => {
      // init.md: 알림 클릭 시 메인 열기
      win.show()
      win.focus()
    })
    n.show()
  }

  if (!win.isDestroyed()) win.webContents.send('alerts:new', entry)
}
