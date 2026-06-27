import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import * as settingsRepo from '../repositories/settingsRepo'

let widget: BrowserWindow | null = null
let main: BrowserWindow | null = null
let clickThrough = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

export function setMainWindow(win: BrowserWindow): void {
  main = win
}

function loadWidget(win: BrowserWindow): void {
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/widget.html`)
  } else {
    win.loadFile(join(__dirname, '../renderer/widget.html'))
  }
}

// ponytail: 이동/리사이즈마다 400ms 디바운스 후 bounds 저장 → 위치·크기 기억.
function saveBounds(): void {
  if (!widget) return
  const b = widget.getBounds()
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => settingsRepo.set({ widgetBounds: b }), 400)
}

function createWidgetWindow(): void {
  const saved = settingsRepo.get().widgetBounds
  const width = saved?.width ?? 240
  const height = saved?.height ?? 320

  // 저장 위치 없으면 메인 창이 있는 디스플레이의 우상단에 배치 (다중 모니터 대응)
  const wa = (main ? screen.getDisplayMatching(main.getBounds()) : screen.getPrimaryDisplay()).workArea
  const x = saved?.x ?? wa.x + wa.width - width - 20
  const y = saved?.y ?? wa.y + 60

  widget = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  widget.setAlwaysOnTop(true, 'floating')
  loadWidget(widget)
  widget.on('moved', saveBounds)
  widget.on('resize', saveBounds)
  widget.on('closed', () => {
    widget = null
    clickThrough = false
  })
}

export function toggleWidget(): boolean {
  if (widget) {
    widget.close()
    return false
  }
  createWidgetWindow()
  return true
}

export function isWidgetOpen(): boolean {
  return widget !== null
}

// 전역 단축키로 토글. ON이면 위젯이 마우스를 통과시켜 뒤 창 클릭 가능.
export function toggleClickThrough(): void {
  if (!widget) return
  clickThrough = !clickThrough
  widget.setIgnoreMouseEvents(clickThrough, { forward: true })
}

export function openMainAndSelect(code: string): void {
  if (!main) return
  if (main.isMinimized()) main.restore()
  main.show()
  main.focus()
  main.webContents.send('main:select', code)
}
