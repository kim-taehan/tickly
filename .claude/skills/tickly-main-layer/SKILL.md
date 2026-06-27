---
name: tickly-main-layer
description: Tickly 메인 프로세스 레이어(shared 타입, SQLite database/repositories, services, ipc 핸들러)를 구현하는 규약. DB 스키마·저장소·외부 API provider·스케줄러·알림·IPC 핸들러 작업 시 반드시 사용. better-sqlite3 네이티브 모듈, 채널 등록 규약 포함.
---

# Tickly Main Layer

메인 프로세스 + shared 레이어 구현 규약. 책임 분리: **repository=순수 DB, service=로직/외부, ipc=얇은 핸들러**.

## 레이어 규약

### shared/ (main·renderer 공용)
- `types.ts`에 도메인 타입. `shared/*.ts`에 순수 로직(예: `isConditionMet`). **Electron/Node import 금지** — renderer도 import한다.
- 두 tsconfig(`tsconfig.node.json`, `tsconfig.web.json`) include에 `src/shared/**/*`가 있어야 한다.

### database/db.ts
- 단일 연결 싱글톤 `getDb()`. 경로는 `join(app.getPath('appData'), 'tickly')` 고정(앱 이름 바뀌어도 DB 위치 불변) + `mkdirSync(dir,{recursive:true})`.
- 스키마는 `CREATE TABLE IF NOT EXISTS ...` 누적. `journal_mode = WAL`.
- 시드는 `seedIfEmpty`(빈 테이블일 때만).

### repositories/<x>Repo.ts
- Row(snake_case, boolean은 0/1) ↔ Model(camelCase) 매핑 함수.
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

## 네이티브 모듈 (better-sqlite3)
- `dependencies`에 두고 `externalizeDepsPlugin()`로 main/preload 번들에서 제외(electron.vite.config).
- Electron ABI로 빌드돼야 함: `pnpm.onlyBuiltDependencies`에 포함 + 필요 시 `pnpm exec electron-rebuild -f -w better-sqlite3`.
- 패키징 시 `asarUnpack: ["**/*.node"]`.

## 산출물
구현 후 `_workspace/main_done.md`에 추가한 채널·반환 shape·새 테이블 요약(renderer/QA가 경계 맞춤).

## 검증
`pnpm typecheck && pnpm build`. DB는 `sqlite3 ~/Library/Application\ Support/tickly/tickly.db ".schema"`로 확인.
