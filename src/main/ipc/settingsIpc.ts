import { ipcMain } from 'electron'
import type { Settings } from '../../shared/types'
import * as settingsRepo from '../repositories/settingsRepo'
import { restartScheduler } from '../services/quoteScheduler'

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', () => settingsRepo.get())
  ipcMain.handle('settings:set', (_e, patch: Partial<Settings>) => {
    const next = settingsRepo.set(patch)
    restartScheduler() // 주기 변경 즉시 반영 (알림 토글은 다음 틱에 반영)
    return next
  })
}
