# Changelog

이 파일의 각 버전 섹션은 배포 시 GitHub Release 본문으로 자동 사용됩니다
(`.github/workflows/release.yml`이 `## [버전]` 섹션을 추출).

형식은 [Keep a Changelog](https://keepachangelog.com/ko/), 버전은 [SemVer](https://semver.org/lang/ko/)를 따릅니다.

## [0.1.1]

### Changed
- 저장소를 SQLite(better-sqlite3) → 로컬 JSON 파일로 전환. 네이티브 모듈 제거로 설치·크로스플랫폼 빌드 단순화.

### Added
- 설정에 "프로그램 종료" 버튼

### Fixed
- 설정의 "업데이트 확인"이 새 버전을 정상 감지하도록 수정 (GitHub API 직접 조회 — 미서명 macOS에서도 동작). 새 버전이 있으면 다운로드 링크 제공.

## [0.1.0]

### Added
- 종목 뉴스 패널 — 종목 선택 시 관련 뉴스(최신 10건) 조회, 클릭 시 시스템 브라우저로 기사 열기 (네이버 뉴스)
- 위젯: 즐겨찾기(★)한 종목만 표시

### Fixed
- 뉴스 제목/요약의 HTML 엔티티(`&quot;` 등)가 그대로 보이던 문제 — 디코딩 적용

## [0.0.4]

### Added
- 차트에 선택 기간(당일/60일) 기준 최소·최대·평균 가격 표시
- 제목창에 버전 표시 (`Tickly (x.y.z)`)
- 설정창 수동 "업데이트 확인" 버튼

## [0.0.3]

### Added
- Intel Mac(x64) · Windows(x64) 빌드 추가 — 전 플랫폼 설치 지원
- 자동 업데이트 (electron-updater, GitHub Release 피드)
- main 브랜치 push + 버전 변경 시 자동 배포 (GitHub Actions)
- 앱 시작 시 위젯 자동 열기

## [0.0.1]

### Added
- 최초 릴리스 (macOS): 관심 종목 검색·관리, 실시간 시세, 당일/일봉 차트,
  조건 알림(데스크톱 알림 + 인앱 배너 + 이력), 데스크톱 위젯, 설정, 로그
