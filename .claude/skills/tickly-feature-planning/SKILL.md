---
name: tickly-feature-planning
description: Tickly 기능 요청을 레이어별 구현 계획과 IPC 계약으로 변환한다. 기능 추가·수정·설계 요청 시 어떤 파일이 shared/main/preload/renderer에서 바뀌는지, IPC 채널·요청/응답 shape을 먼저 확정할 때 사용. "기능 추가", "어떻게 구현", "설계", "계획" 같은 요청에 반드시 사용.
---

# Tickly Feature Planning

Tickly 기능 하나를 **변경 파일 목록 + IPC 계약**으로 변환한다. 코드는 쓰지 않는다.

## 왜 계약을 먼저 정하나
Tickly는 main과 renderer가 IPC 채널 문자열·반환 shape으로만 연결된다. 이 계약이 모호하면 두 구현자가 서로 다른 채널명/shape을 만들어 경계 버그가 난다. 계약을 먼저 고정하면 둘이 병렬로 안전하게 구현한다.

## 절차
1. **흐름 추적**: 요청이 닿는 기존 코드를 읽는다. 비슷한 기존 기능(예: watchlist, conditions, alerts)의 파일 세트를 참고 패턴으로 삼는다.
2. **레이어 매핑**: 변경을 레이어로 나눈다.
   - `shared/types.ts` — 도메인 타입 / `shared/*.ts` — 순수 로직(main·renderer 공용)
   - `main/database/db.ts` — 새 테이블(`CREATE TABLE IF NOT EXISTS`)
   - `main/repositories/<x>Repo.ts` — CRUD(Row↔Model 매핑, mutation은 갱신 목록 반환)
   - `main/services/*` — 외부 API·스케줄·알림 등 로직
   - `main/ipc/<domain>Ipc.ts` — 핸들러, `index.ts` whenReady에 register
   - `preload/index.ts` + `index.d.ts` — `window.tickly.<domain>` 노출 + 타입
   - `renderer/src/components/*` + 상태 — UI
3. **IPC 계약 확정** (표):

   | 채널 | 인자 | 반환 |
   |------|------|------|
   | `domain:action` | `(arg: T)` | `Promise<R>` |

   - 채널명은 `domain:action` 케밥/콜론 규약. mutation은 갱신된 전체 목록 반환(renderer는 상태 교체만).
   - push가 필요하면(주기 갱신 등) `webContents.send('domain:event')` + preload `onX(cb)` 구독 형태.
4. **검증 기준 정의**: typecheck/build 통과 + 런타임 확인 방법(SQLite 행, 로그, 화면).
5. **생략 명시**: YAGNI로 미루는 것을 한 줄씩.

## 산출물
`_workspace/plan.md`에 ①파일 목록(레이어별) ②IPC 계약 표 ③shared 타입 변경 ④검증 기준 ⑤생략 항목.

## 원칙
- 최소 변경. 새 의존성/추상화는 실제 필요 + 이유 명시. provider 같은 인터페이스는 구현이 2개 이상일 때만.
- 미래 확장은 고려하되 과도한 추상화 금지(개인용 앱).
