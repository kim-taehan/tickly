import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { checkForUpdates } from '../services/autoUpdate'
import log from '../services/logger'

export function registerAppIpc(): void {
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:checkForUpdates', () => checkForUpdates())
  ipcMain.handle('app:quit', () => {
    // 위젯 등 모든 창을 확실히 닫고 종료 (always-on-top 위젯이 남는 문제 방지)
    BrowserWindow.getAllWindows().forEach((w) => w.destroy())
    app.quit()
  })
  // 외부 링크 열기. http/https만 허용(보안 경계). 그 외/파싱 실패는 무시 + warn.
  ipcMain.handle('app:openExternal', async (_e, url: string) => {
    try {
      const { protocol } = new URL(url)
      if (protocol === 'http:' || protocol === 'https:') {
        await shell.openExternal(url)
        return
      }
      log.warn('[app] openExternal blocked non-http(s) url:', url)
    } catch {
      log.warn('[app] openExternal invalid url:', url)
    }
  })
}
