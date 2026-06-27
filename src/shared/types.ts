export interface Stock {
  code: string // 종목코드 e.g. "005930"
  name: string // 삼성전자
  price: number // 현재가 — Phase 4에서 라이브 갱신, 그전까진 정적
  change: number // 전일대비 (원)
  changeRate: number // 등락률 (%)
  volume: number // 거래량
  favorite: boolean
}

// 시세 조회 결과(provider → DB/렌더러). Stock의 가격성 필드만.
export interface Quote {
  code: string
  price: number
  change: number
  changeRate: number
  volume: number
}

// 종목 검색 결과 (code + name + 시장). 가격은 추가 시 조회.
export interface SearchItem {
  code: string
  name: string
  market: string // 코스피 / 코스닥
}

// 일봉 한 점. 차트용. ponytail: OHLC 캔들 원하면 open/high/low 추가.
export interface Candle {
  date: string // YYYY-MM-DD
  close: number
  volume: number
}

// 조건: 시세 필드 하나를 임계값과 비교. RSI/MACD(히스토리 계산)는 추후 Strategy로.
export type Metric = 'price' | 'changeRate' | 'volume'
export type Operator = 'gte' | 'lte' // 이상 | 이하

export interface Condition {
  id: number
  code: string
  metric: Metric
  operator: Operator
  threshold: number
  enabled: boolean
}

export type NewCondition = Omit<Condition, 'id'>

// 앱 설정. ponytail: 지금은 주기·알림만. 테마·provider·API Key 등은 해당 기능 Phase에서 추가.
export interface Settings {
  intervalMs: number
  alertsEnabled: boolean
  widgetBounds?: { x: number; y: number; width: number; height: number }
}

// 수동 업데이트 확인 결과.
export interface UpdateCheckResult {
  current: string
  latest?: string
  status: 'dev' | 'latest' | 'downloading' | 'error'
  message: string
}

// 알림 이력 한 건.
export interface AlertHistory {
  id: number
  code: string
  name: string
  message: string
  price: number
  firedAt: string // ISO 8601
}
