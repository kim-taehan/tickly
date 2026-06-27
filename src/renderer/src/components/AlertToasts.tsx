import { X, Bell } from 'lucide-react'
import type { AlertHistory } from '../../../shared/types'

// 닫기 전엔 사라지지 않는 인앱 알림 배너 (macOS 네이티브 배너의 자동소멸 보완).
export default function AlertToasts({
  toasts,
  onDismiss
}: {
  toasts: AlertHistory[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-72">
      {toasts.map((t) => (
        <div key={t.id} className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 flex gap-2">
          <Bell className="size-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{t.name}</div>
            <div className="text-xs text-gray-600">{t.message}</div>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-700 shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
