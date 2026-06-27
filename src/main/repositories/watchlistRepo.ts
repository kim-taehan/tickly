import type { Stock, Quote } from '../../shared/types'
import { getDb } from '../database/db'

// DB row(snake_case, favorite 0/1) → Stock(camelCase, boolean)
interface Row {
  code: string
  name: string
  price: number
  change: number
  change_rate: number
  volume: number
  favorite: number
}

const toStock = (r: Row): Stock => ({
  code: r.code,
  name: r.name,
  price: r.price,
  change: r.change,
  changeRate: r.change_rate,
  volume: r.volume,
  favorite: r.favorite === 1
})

export function list(): Stock[] {
  return (getDb().prepare('SELECT * FROM watchlist ORDER BY sort_order').all() as Row[]).map(toStock)
}

export function add(stock: Stock): Stock[] {
  const db = getDb()
  const { max } = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS max FROM watchlist').get() as { max: number }
  db.prepare(
    `INSERT OR IGNORE INTO watchlist (code, name, price, change, change_rate, volume, favorite, sort_order)
     VALUES (@code, @name, @price, @change, @changeRate, @volume, @favorite, @sortOrder)`
  ).run({ ...stock, favorite: stock.favorite ? 1 : 0, sortOrder: max + 1 })
  return list()
}

export function remove(code: string): Stock[] {
  getDb().prepare('DELETE FROM watchlist WHERE code = ?').run(code)
  return list()
}

export function toggleFavorite(code: string): Stock[] {
  getDb().prepare('UPDATE watchlist SET favorite = 1 - favorite WHERE code = ?').run(code)
  return list()
}

export function updateQuotes(quotes: Quote[]): void {
  const stmt = getDb().prepare(
    'UPDATE watchlist SET price = @price, change = @change, change_rate = @changeRate, volume = @volume WHERE code = @code'
  )
  getDb().transaction((qs: Quote[]) => qs.forEach((q) => stmt.run(q)))(quotes)
}
