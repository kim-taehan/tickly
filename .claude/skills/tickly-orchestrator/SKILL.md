---
name: tickly-orchestrator
description: Tickly(Electron 한국 주식 앱) 기능 개발을 에이전트 팀으로 조율하는 오케스트레이터. 기능 추가·수정·리팩토링·버그수정 요청 시 사용 — architect 설계 → main/renderer 병렬 구현 → QA 경계검증의 파이프라인을 돌린다. "기능 추가", "구현해줘", "고쳐줘", "다시 실행", "재실행", "업데이트", "보완", "이전 결과 기반으로", "~만 다시" 같은 표현에 반드시 사용. 단순 질문·설명 요청은 직접 응답.
---

# Tickly Orchestrator

Tickly 기능 개발을 에이전트 팀으로 조율한다. 실행 모드: **에이전트 팀**(파이프라인: 설계 → 병렬 구현 → 검증).

## Phase 0: 컨텍스트 확인
1. `_workspace/` 존재 여부 확인.
   - 없음 → **초기 실행**.
   - 있음 + 부분 수정 요청("조건 폼만 다시") → **부분 재실행**(해당 에이전트만 재호출, 기존 plan 재사용).
   - 있음 + 새 기능 → 기존 `_workspace/`를 `_workspace_prev/`로 옮기고 **새 실행**.
2. 단순 질문이면 팀을 만들지 않고 직접 답한다.

## Phase 1: 설계 (architect 단독)
- `TeamCreate`로 팀 구성 후, `tickly-architect`에게 요청 전달.
- 산출: `_workspace/plan.md`(파일 목록 + IPC 계약 표 + 검증 기준).
- **게이트**: 계약이 확정돼야 다음으로 간다. 모호하면 architect가 기본안 명시.

## Phase 2: 병렬 구현 (main + renderer 팀)
- `tickly-main-engineer`와 `tickly-renderer-engineer`를 **동시** 가동.
- 둘은 `plan.md`의 IPC 계약을 공유 계약으로 삼고, shared 타입·채널명·반환 shape을 `SendMessage`로 동기화한다.
- 산출: `main_done.md`, `renderer_done.md`.

## Phase 3: 통합 검증 (QA)
- `tickly-integration-qa`가 경계 교차 검증 + `pnpm typecheck && pnpm build` + (main 변경 시) dev 재시작 런타임 확인.
- 산출: `qa_report.md`.
- **FAIL 시**: QA가 해당 구현자에게 직접 수정 요청 → 재검증. 계약 문제면 architect로.

## 팀 구성·데이터 전달
- 팀원: architect, main-engineer, renderer-engineer, integration-qa (4명).
- **모든 Agent 호출에 `model: "opus"` 명시.**
- 전달: 태스크 기반(`TaskCreate`로 의존성) + 파일 기반(`_workspace/` 산출물) + 메시지 기반(계약 동기화).
- 파일명: `_workspace/{phase}_{artifact}.md`. 최종 코드만 실제 경로, 중간물은 `_workspace/` 보존.

## 에러 핸들링
- 각 단계 1회 재시도, 재실패 시 결과 없이 진행 + `qa_report.md`에 누락 명시.
- 상충/실패는 삭제하지 않고 출처(file:line) 병기.
- QA가 2회 검증 후에도 FAIL이면 사용자에게 보고하고 멈춘다.

## 테스트 시나리오
- **정상 흐름**: "종목별 메모 기능 추가" → architect가 `notes` 테이블 + `notes:get/save` 계약 설계 → main이 repo/ipc, renderer가 preload+패널 병렬 구현 → QA가 채널 3자 일치 + 빌드 확인 → 완료.
- **에러 흐름**: renderer가 `index.d.ts` 갱신 누락 → QA의 경계 검증 #2에서 FAIL 감지 → renderer-engineer에 위치 명시 수정 요청 → 재검증 PASS.

## 완료 후
사용자에게 변경 요약(레이어별)과 검증 결과를 보고하고, 개선점 피드백 기회를 제공한다(Phase 7 진화).
