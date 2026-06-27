import { app, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { registerWatchlistIpc } from './ipc/watchlistIpc'
import { registerSearchIpc } from './ipc/searchIpc'
import { registerChartIpc } from './ipc/chartIpc'
import { registerConditionsIpc } from './ipc/conditionsIpc'
import { registerAlertsIpc } from './ipc/alertsIpc'
import { registerSettingsIpc } from './ipc/settingsIpc'
import { registerWidgetIpc } from './ipc/widgetIpc'
import { startQuoteScheduler } from './services/quoteScheduler'
import { setMainWindow, toggleClickThrough, openWidget } from './services/widgetWindow'
import log from './services/logger'
import { initAutoUpdate } from './services/autoUpdate'

// 앱 이름 (알림 출처 등). 메뉴바 굵은 이름은 패키징해야 완전히 바뀜.
app.setName('Tickly')

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  setMainWindow(win)

  win.on('ready-to-show', () => {
    win.show()
    startQuoteScheduler(win)
  })

  // electron-vite injects this in dev; falls back to the built file in prod.
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  log.info('[app] ready')

  // dev에서도 Dock 아이콘 교체 (패키징 시엔 build/icon.icns 사용)
  const iconPath = join(app.getAppPath(), 'build', 'icon.png')
  if (process.platform === 'darwin' && app.dock && existsSync(iconPath)) {
    app.dock.setIcon(iconPath)
  }

  registerWatchlistIpc()
  registerSearchIpc()
  registerChartIpc()
  registerConditionsIpc()
  registerAlertsIpc()
  registerSettingsIpc()
  registerWidgetIpc()
  createWindow()
  openWidget() // 시작 시 위젯 자동 오픈

  // 패키징된 앱에서만 자동 업데이트 확인 (dev에선 no-op)
  if (app.isPackaged) initAutoUpdate()

  // 위젯 Click-through 토글 단축키
  globalShortcut.register('CommandOrControl+Shift+T', toggleClickThrough)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
