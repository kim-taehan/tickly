import type { Stock, Quote } from '../../shared/types'
import { getData, save } from '../database/store'

export function list(): Stock[] {
  return getData().watchlist
}

export function add(stock: Stock): Stock[] {
  const d = getData()
  if (!d.watchlist.some((s) => s.code === stock.code)) {
    d.watchlist.push({ ...stock })
    save()
  }
  return d.watchlist
}

export function remove(code: string): Stock[] {
  const d = getData()
  d.watchlist = d.watchlist.filter((s) => s.code !== code)
  save()
  return d.watchlist
}

export function toggleFavorite(code: string): Stock[] {
  const d = getData()
  const s = d.watchlist.find((x) => x.code === code)
  if (s) {
    s.favorite = !s.favorite
    save()
  }
  return d.watchlist
}

export function updateQuotes(quotes: Quote[]): void {
  const d = getData()
  let changed = false
  for (const q of quotes) {
    const s = d.watchlist.find((x) => x.code === q.code)
    if (s) {
      s.price = q.price
      s.change = q.change
      s.changeRate = q.changeRate
      s.volume = q.volume
      changed = true
    }
  }
  if (changed) save()
}
