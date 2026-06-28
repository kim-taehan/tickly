import { ipcMain } from 'electron'
import { getProvider } from '../services/quotes'

export function registerNewsIpc(): void {
  ipcMain.handle('news:list', (_e, code: string) => getProvider().getNews(code))
}
