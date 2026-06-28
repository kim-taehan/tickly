import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateCheckResult } from '../../shared/types'
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

const RELEASES_API = 'https://api.github.com/repos/kim-taehan/tickly/releases/latest'

// a가 b보다 최신인가 (semver x.y.z 숫자 비교)
function isNewer(a: string, b: string): boolean {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const x = pa[i] || 0
    const y = pb[i] || 0
    if (x !== y) return x > y
  }
  return false
}

// 설정창의 수동 "업데이트 확인" — GitHub Releases API로 직접 비교.
// electron-updater의 macOS 코드서명 제약을 우회 → 미서명 앱에서도 동작.
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const current = app.getVersion()
  try {
    const res = await fetch(RELEASES_API, { headers: { 'User-Agent': 'Tickly' } })
    if (!res.ok) return { current, status: 'error', message: '업데이트 정보를 가져오지 못했습니다.' }
    const json = (await res.json()) as { tag_name?: string; html_url?: string }
    const latest = (json.tag_name ?? '').replace(/^v/, '')
    if (latest && isNewer(latest, current)) {
      return { current, latest, status: 'available', message: `새 버전 ${latest}이 있습니다.`, url: json.html_url }
    }
    return { current, latest, status: 'latest', message: '최신 버전입니다.' }
  } catch {
    return { current, status: 'error', message: '업데이트 확인 실패 (네트워크 오류).' }
  }
}
