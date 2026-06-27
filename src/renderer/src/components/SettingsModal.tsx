import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Settings } from '../../../shared/types'
import { INTERVAL_OPTIONS, intervalLabel } from '../../../shared/settings'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [version, setVersion] = useState('')
  const [updateMsg, setUpdateMsg] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    window.tickly.settings.get().then(setSettings)
    window.tickly.app.version().then(setVersion)
  }, [])

  const update = (patch: Partial<Settings>): void => {
    window.tickly.settings.set(patch).then(setSettings)
  }

  const checkUpdate = (): void => {
    setChecking(true)
    setUpdateMsg('')
    window.tickly.app
      .checkForUpdates()
      .then((r) => setUpdateMsg(r.message))
      .finally(() => setChecking(false))
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-80 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">설정</h2>
          <button onClick={onClose} aria-label="닫기" className="text-gray-400 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        {!settings ? (
          <p className="text-sm text-gray-400">불러오는 중…</p>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-700">조회 주기</span>
              <select
                value={settings.intervalMs}
                onChange={(e) => update({ intervalMs: Number(e.target.value) })}
                className="h-8 px-2 rounded-md border border-gray-200 bg-white"
              >
                {INTERVAL_OPTIONS.map((ms) => (
                  <option key={ms} value={ms}>
                    {intervalLabel(ms)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-700">알림 사용</span>
              <input
                type="checkbox"
                checked={settings.alertsEnabled}
                onChange={(e) => update({ alertsEnabled: e.target.checked })}
                className="size-4"
              />
            </label>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">버전 {version && `v${version}`}</span>
                <button
                  onClick={checkUpdate}
                  disabled={checking}
                  className="h-8 px-3 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {checking ? '확인 중…' : '업데이트 확인'}
                </button>
              </div>
              {updateMsg && <p className="mt-2 text-xs text-gray-500">{updateMsg}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
