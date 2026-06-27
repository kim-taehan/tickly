import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { SEED_STOCKS } from '../../shared/stocks'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  // appData/tickly 고정 — app 이름을 바꿔도 DB 위치가 따라 움직이지 않게.
  const dir = join(app.getPath('appData'), 'tickly')
  mkdirSync(dir, { recursive: true })
  db = new Database(join(dir, 'tickly.db'))
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      code        TEXT PRIMARY KEY,
      name        TEXT    NOT NULL,
      price       INTEGER NOT NULL DEFAULT 0,
      change      INTEGER NOT NULL DEFAULT 0,
      change_rate REAL    NOT NULL DEFAULT 0,
      volume      INTEGER NOT NULL DEFAULT 0,
      favorite    INTEGER NOT NULL DEFAULT 0,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conditions (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      code      TEXT    NOT NULL,
      metric    TEXT    NOT NULL,  -- price | changeRate | volume
      operator  TEXT    NOT NULL,  -- gte | lte
      threshold REAL    NOT NULL,
      enabled   INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_conditions_code ON conditions(code);

    CREATE TABLE IF NOT EXISTS alert_history (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      code     TEXT NOT NULL,
      name     TEXT NOT NULL,
      message  TEXT NOT NULL,
      price    REAL NOT NULL,
      fired_at TEXT NOT NULL  -- ISO 8601
    );
    CREATE INDEX IF NOT EXISTS idx_alert_history_code ON alert_history(code);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  seedIfEmpty(db)
  return db
}

function seedIfEmpty(db: Database.Database): void {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM watchlist').get() as { n: number }
  if (n > 0) return

  const insert = db.prepare(
    `INSERT INTO watchlist (code, name, price, change, change_rate, volume, favorite, sort_order)
     VALUES (@code, @name, @price, @change, @changeRate, @volume, @favorite, @sortOrder)`
  )
  const seed = db.transaction(() => {
    SEED_STOCKS.forEach((s, i) =>
      insert.run({ ...s, favorite: s.favorite ? 1 : 0, sortOrder: i })
    )
  })
  seed()
}
