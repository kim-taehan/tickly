import { ipcMain } from 'electron'
import { toggleWidget, isWidgetOpen, openMainAndSelect } from '../services/widgetWindow'

export function registerWidgetIpc(): void {
  ipcMain.handle('widget:toggle', () => toggleWidget())
  ipcMain.handle('widget:isOpen', () => isWidgetOpen())
  ipcMain.handle('widget:openMain', (_e, code: string) => openMainAndSelect(code))
}
