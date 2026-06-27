import { app, ipcMain } from 'electron'
import { checkForUpdates } from '../services/autoUpdate'

export function registerAppIpc(): void {
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:checkForUpdates', () => checkForUpdates())
}
