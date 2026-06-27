import { ipcMain } from 'electron'
import type { NewCondition } from '../../shared/types'
import * as repo from '../repositories/conditionsRepo'

export function registerConditionsIpc(): void {
  ipcMain.handle('conditions:list', (_e, code: string) => repo.list(code))
  ipcMain.handle('conditions:add', (_e, c: NewCondition) => repo.add(c))
  ipcMain.handle('conditions:remove', (_e, id: number, code: string) => repo.remove(id, code))
  ipcMain.handle('conditions:toggle', (_e, id: number, code: string) => repo.toggle(id, code))
}
