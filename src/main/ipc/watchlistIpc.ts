import { ipcMain } from 'electron'
import type { SearchItem } from '../../shared/types'
import * as repo from '../repositories/watchlistRepo'
import { getProvider } from '../services/quotes'

export function registerWatchlistIpc(): void {
  ipcMain.handle('watchlist:list', () => repo.list())

  // 추가 시 즉시 시세 1회 조회해 가격까지 채움 (실패해도 0으로 넣고 다음 틱이 채움).
  ipcMain.handle('watchlist:add', async (_e, item: SearchItem) => {
    const [q] = await getProvider().getQuotes([item.code])
    return repo.add({
      code: item.code,
      name: item.name,
      price: q?.price ?? 0,
      change: q?.change ?? 0,
      changeRate: q?.changeRate ?? 0,
      volume: q?.volume ?? 0,
      favorite: false
    })
  })

  ipcMain.handle('watchlist:remove', (_e, code: string) => repo.remove(code))
  ipcMain.handle('watchlist:toggleFavorite', (_e, code: string) => repo.toggleFavorite(code))
}
