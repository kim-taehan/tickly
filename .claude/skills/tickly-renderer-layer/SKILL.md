---
name: tickly-renderer-layer
description: Tickly의 preload 브릿지(window.tickly + index.d.ts)와 renderer(React 컴포넌트, Tailwind v4, 상태, 위젯 창)를 구현하는 규약. UI 추가·수정, IPC 소비, 라이브 시세 표시, 위젯 작업 시 반드시 사용. 한국 등락 색상 규약 포함.
---

# Tickly Renderer Layer

preload + renderer 레이어 구현 규약. preload는 main과 renderer를 잇는 유일한 다리다.

## preload 규약 (둘을 항상 함께 갱신)
- `preload/index.ts`: 도메인별 객체를 만들어 `contextBridge.exposeInMainWorld('tickly', { watchlist, quotes, ... })`로 노출.
  - invoke: `(arg) => ipcRenderer.invoke('domain:action', arg)`
  - push 구독: `onX(cb)` → `ipcRenderer.on('domain:event', listener)` 등록하고 **해제 함수를 반환**.
- `preload/index.d.ts`: 같은 API의 타입을 `Window.tickly`에 선언. **런타임(index.ts)과 타입(index.d.ts)이 어긋나면 경계 버그** — 반드시 동시 수정.

## renderer 규약
- React 컴포넌트는 `renderer/src/components/`, 한 가지 책임.
- 상태: 공유 상태가 실제로 필요하기 전엔 `useState`로 충분(Zustand 미도입). 라이브 데이터는 push 구독으로 갱신:
  ```ts
  useEffect(() => window.tickly.quotes.onUpdate(q => setStocks(prev => merge(prev,q))), [])
  ```
- 스타일: **Tailwind v4**(`@import 'tailwindcss'`, config 파일 없음). 아이콘은 lucide-react.
- **한국 등락 색상**: 상승=빨강, 하락=파랑, 보합=회색. `lib/format.ts`의 `rateColor`/`signed`/`won` 재사용(DRY) — 색 규칙 중복 금지.
- 차트는 Recharts. 날짜·숫자 포맷은 공용 헬퍼.

## 위젯(별도 창)
- 두 번째 렌더러 엔트리(`renderer/widget.html` + `src/widget.tsx`). 같은 preload를 쓰므로 `window.tickly` 그대로 사용.
- 프레임리스/투명 창의 드래그 영역은 `.drag-region`/`.no-drag`(`-webkit-app-region`).

## 산출물
구현 후 `_workspace/renderer_done.md`에 소비한 채널·새 컴포넌트 요약.

## 검증
`pnpm typecheck && pnpm build`. UI는 dev 재시작 후 확인(QA 스킬의 재시작 명령). 렌더러만 바뀌면 HMR로 반영(Electron 재시작 불필요).
