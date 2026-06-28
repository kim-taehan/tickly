---
name: tickly-main-layer
description: Tickly 메인 프로세스 레이어(shared 타입, 로컬 파일 저장소/repositories, services, ipc 핸들러)를 구현하는 규약. 저장소·외부 API provider·스케줄러·알림·IPC 핸들러 작업 시 반드시 사용. 채널 등록 규약 포함.
---

# Tickly Main Layer

메인 프로세스 + shared 레이어 구현 규약. 책임 분리: **repository=저장소 접근, service=로직/외부, ipc=얇은 핸들러**.

## 레이어 규약

### shared/ (main·renderer 공용)
- `types.ts`에 도메인 타입. `shared/*.ts`에 순수 로직(예: `isConditionMet`). **Electron/Node import 금지** — renderer도 import한다.
- 두 tsconfig(`tsconfig.node.json`, `tsconfig.web.json`) include에 `src/shared/**/*`가 있어야 한다.

### database/store.ts (로컬 JSON 파일 저장소 — SQLite 아님)
- 데이터 규모가 작고 단일 프로세스라 파일 저장이면 충분. **네이티브 모듈(better-sqlite3) 쓰지 말 것** — 크로스플랫폼 빌드 마찰만 늘린다.
- `getData()`: 시작 시 `appData/tickly/tickly.json` 1회 로드(인메모리 캐시). 경로는 `join(app.getPath('appData'), 'tickly')` 고정(앱 이름 무관) + `mkdirSync`.
- `save()`: **원자적 쓰기**(tmp 작성 후 `renameSync`) — 중간 크래시에도 손상 방지. 데이터 손실 방지는 줄이지 않는다.
- 손상/부재 시 `defaults()`(SEED_STOCKS 시드 포함). 자동증가 id는 `seq` 카운터로.

### repositories/<x>Repo.ts
- `getData()`의 인메모리 배열/객체를 직접 조작하고 변경 후 `save()`. 별도 Row↔Model 매핑 불필요(JSON이 곧 camelCase 모델).
- **mutation은 갱신된 전체 목록을 반환**(renderer가 상태만 교체). 예: `add()/remove()/toggle()` → `list()`.
- 코드별 조회는 인자로 받는다(`remove(id, code)`).

### services/
- 외부 API는 provider **Strategy 인터페이스**(`QuoteProvider`)로 — 구현이 2개 이상(naver/kis)이라 정당. 새 provider는 `services/quotes/index.ts` 레지스트리에 등록.
- 네이티브 fetch 사용(axios 미사용). 외부 응답은 좁은 인터페이스로 타이핑.
- 주기 작업은 `quoteScheduler`(setInterval, 설정 주기 읽기, `restartScheduler`로 재적용).
- 로깅은 `services/logger.ts`(electron-log) — `log.info/error`. console 금지.

### ipc/<domain>Ipc.ts
- `ipcMain.handle('domain:action', (_e, args) => repo.x(args))` — 얇게.
- `index.ts`의 `whenReady`에서 `registerXIpc()` 호출(등록 빠지면 채널 죽음).
- 채널명은 architect가 정한 계약 그대로.

## 의존성 원칙
- **네이티브 모듈 피하기**(C++ addon). 크로스플랫폼 빌드·ABI·패키징 마찰이 크다. 저장은 JSON 파일로 충분.
- 새 의존성은 stdlib/네이티브(fetch 등)로 안 되는 게 확실할 때만, 이유를 명시.

## 산출물
구현 후 `_workspace/main_done.md`에 추가한 채널·반환 shape·저장 구조 변경 요약(renderer/QA가 경계 맞춤).

## 검증
`pnpm typecheck && pnpm build`. 저장 데이터는 `cat ~/Library/Application\ Support/tickly/tickly.json`으로 확인.
