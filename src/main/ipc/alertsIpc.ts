import { ipcMain } from 'electron'
import * as historyRepo from '../repositories/alertHistoryRepo'

export function registerAlertsIpc(): void {
  ipcMain.handle('alerts:list', (_e, code: string) => historyRepo.list(code))
}
