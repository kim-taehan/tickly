import { ipcMain } from 'electron'
import { getProvider } from '../services/quotes'

export function registerSearchIpc(): void {
  ipcMain.handle('search:stocks', (_e, query: string) => getProvider().search(query))
}
