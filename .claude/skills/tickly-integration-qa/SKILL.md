---
name: tickly-integration-qa
description: Tickly의 레이어 경계 정합성을 교차 검증하고 typecheck/build/런타임을 실행하는 QA 규약. IPC 채널·preload d.ts·반환 shape이 main과 renderer에서 일치하는지 확인. 구현 후 검증, "검증/QA/통합 확인" 요청 시 반드시 사용.
---

# Tickly Integration QA

Tickly의 지배적 버그는 레이어 간 **드리프트**다. "파일 존재"가 아니라 "경계 일치"를 본다.

## 경계 교차 검증 (핵심 — 명령 예시)

### 1. IPC 채널 3자 일치
핸들러 ↔ invoke ↔ 등록이 같은 채널명인지.
```bash
grep -rn "ipcMain.handle(" src/main/ipc          # 핸들러 채널 목록
grep -rn "ipcRenderer.invoke(\|ipcRenderer.on(" src/preload   # preload 채널 목록
grep -rn "register.*Ipc()" src/main/index.ts     # whenReady 등록 여부
```
세 목록의 채널 문자열이 정확히 매칭돼야 한다. 등록 빠진 핸들러 = 죽은 채널.

### 2. preload 런타임 ↔ 타입 ↔ 사용처
`preload/index.ts`가 노출한 메서드가 `preload/index.d.ts`의 `Window.tickly` 타입에 모두 있고, renderer 사용처와 시그니처가 맞는지. 누락/오타 시 renderer에서 `window.tickly.X`가 undefined.

### 3. 반환 shape 일치
repository/ipc 반환 객체의 필드 ↔ renderer가 읽는 `shared` 타입 필드. snake/camel 매핑 누락이 흔한 버그.

### 4. shared 순수성
```bash
grep -rn "from 'electron'\|require('electron')\|app.getPath" src/shared   # 비어야 정상
```

## 실행 검증
```bash
pnpm typecheck && pnpm build      # 필수, 둘 다 통과
```
런타임(필요 시):
```bash
# dev 재시작 (main 변경 시). 렌더러만 바뀌면 HMR이라 불필요.
pkill -f "electron-vite dev"; pkill -f "Electron.app"; sleep 1
pnpm dev > /tmp/tickly-dev.log 2>&1 &
sleep 8
# DB 확인
sqlite3 ~/Library/Application\ Support/tickly/tickly.db ".tables"
# 로그 확인
tail -10 ~/Library/Logs/tickly/main.log
```

## 점진적 검증 (중요)
전체 완성 후 1회가 아니라 **main 완료 직후**(채널·shape·테이블) → **renderer 완료 직후**(d.ts·사용처) 각각 본다. 버그를 늦게 발견할수록 비싸다.

## 산출물
`_workspace/qa_report.md`: 체크항목별 PASS/FAIL + 불일치 위치(file:line) + 수정 요청 대상. 실패는 출처와 함께 보고(삭제 금지).
