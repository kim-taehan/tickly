import { ipcMain } from 'electron'
import { getProvider } from '../services/quotes'

export function registerChartIpc(): void {
  ipcMain.handle('chart:daily', (_e, code: string, count: number) => getProvider().getDailyChart(code, count))
  ipcMain.handle('chart:intraday', (_e, code: string) => getProvider().getIntradayChart(code))
}
