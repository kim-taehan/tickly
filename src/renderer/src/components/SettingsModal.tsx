import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Settings } from '../../../shared/types'
import { INTERVAL_OPTIONS, intervalLabel } from '../../../shared/settings'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    window.tickly.settings.get().then(setSettings)
  }, [])

  const update = (patch: Partial<Settings>): void => {
    window.tickly.settings.set(patch).then(setSettings)
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
          </div>
        )}
      </div>
    </div>
  )
}
