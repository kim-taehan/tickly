# CLAUDE.md — Tickly

## 하네스: Tickly 기능 개발 (Electron + React + TS)

**목표:** 레이어 분리(shared → main → preload → renderer)를 지키며 기능을 안전하게 추가하고, 경계면 드리프트(IPC 채널·preload d.ts·반환 shape 불일치)를 QA로 차단한다.

**트리거:** 기능 추가·수정·리팩토링·버그수정 요청 시 `tickly-orchestrator` 스킬을 사용하라(architect 설계 → main/renderer 병렬 구현 → QA 경계검증). 단순 질문·설명은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-28 | 초기 구성 (4 에이전트 + 5 스킬) | 전체 | 신규 하네스 구축 |
| 2026-06-28 | 저장 규약 SQLite→JSON 파일로 갱신 | skills/tickly-main-layer | 네이티브 모듈 제거(better-sqlite3) |
