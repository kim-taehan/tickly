import { autoUpdater } from 'electron-updater'
import log from './logger'

// GitHub Release를 피드로 자동 업데이트 (publish 설정에서 주소 자동 주입).
// 다운로드 후 앱 종료 시 설치. macOS는 코드 서명이 있어야 설치까지 적용됨.
export function initAutoUpdate(): void {
  autoUpdater.logger = log
  autoUpdater.on('update-available', (i) => log.info(`[update] available ${i.version}`))
  autoUpdater.on('update-downloaded', (i) => log.info(`[update] downloaded ${i.version} (다음 종료 시 설치)`))
  autoUpdater.on('error', (e) => log.error('[update] error', e))

  autoUpdater.checkForUpdatesAndNotify()
  // ponytail: 4시간마다 재확인. 장시간 켜두는 위젯 특성상 주기 확인이 유용.
  setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 4 * 60 * 60 * 1000)
}
