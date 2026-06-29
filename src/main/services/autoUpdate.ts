import { app, net, Notification, shell } from 'electron'
import type { UpdateCheckResult } from '../../shared/types'
import log from './logger'

// 미서명 macOS 앱이라 electron-updater 자동 설치(Squirrel.Mac)는 코드 서명 검증에서 항상 실패한다.
// → 자동 설치 대신 GitHub Releases를 확인해 새 버전이면 알림을 띄우고, 클릭 시 다운로드 페이지를 연다.
// 무음 자동 설치가 필요하면 코드 서명 + 공증(notarization) 후 electron-updater 복귀.
export function initAutoUpdate(): void {
  void notifyIfUpdate()
  // ponytail: 4시간마다 재확인. 장시간 켜두는 위젯 특성상 주기 확인이 유용.
  setInterval(() => void notifyIfUpdate(), 4 * 60 * 60 * 1000)
}

async function notifyIfUpdate(): Promise<void> {
  const r = await checkForUpdates()
  if (r.status !== 'available' || !r.url) return
  log.info(`[update] available ${r.latest}`)
  const n = new Notification({ title: `새 버전 ${r.latest}`, body: '클릭하면 다운로드 페이지가 열립니다.' })
  n.on('click', () => void shell.openExternal(r.url!))
  n.show()
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
    // net.fetch: 회사 프록시 self-signed CA 환경에서도 OS 인증서 저장소를 따라 TLS 통과.
    const res = await net.fetch(RELEASES_API, { headers: { 'User-Agent': 'Tickly' } })
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
