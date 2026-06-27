import type { Stock } from './types'

// 정적 종목 후보 목록. DB 시드(앞 6개) + 검색-추가 후보로 함께 사용.
// ponytail: 실종목 검색은 Phase 4 시세 API의 종목 마스터로 대체.
export const STOCK_UNIVERSE: Stock[] = [
  { code: '005930', name: '삼성전자', price: 71000, change: 840, changeRate: 1.2, volume: 12_345_678, favorite: true },
  { code: '000660', name: 'SK하이닉스', price: 178000, change: -1400, changeRate: -0.78, volume: 3_210_987, favorite: true },
  { code: '035420', name: 'NAVER', price: 192500, change: 2500, changeRate: 1.32, volume: 987_654, favorite: false },
  { code: '035720', name: '카카오', price: 41250, change: -300, changeRate: -0.72, volume: 2_456_789, favorite: false },
  { code: '005380', name: '현대차', price: 245000, change: 0, changeRate: 0, volume: 654_321, favorite: false },
  { code: '373220', name: 'LG에너지솔루션', price: 388000, change: 9000, changeRate: 2.37, volume: 432_109, favorite: true },
  { code: '207940', name: '삼성바이오로직스', price: 1_021_000, change: -5000, changeRate: -0.49, volume: 89_012, favorite: false },
  { code: '005490', name: 'POSCO홀딩스', price: 412000, change: 6000, changeRate: 1.48, volume: 321_098, favorite: false },
  { code: '051910', name: 'LG화학', price: 398500, change: -2500, changeRate: -0.62, volume: 210_987, favorite: false },
  { code: '006400', name: '삼성SDI', price: 367000, change: 4000, changeRate: 1.1, volume: 198_765, favorite: false },
  { code: '068270', name: '셀트리온', price: 178500, change: 1500, changeRate: 0.85, volume: 543_210, favorite: false },
  { code: '105560', name: 'KB금융', price: 78900, change: -600, changeRate: -0.75, volume: 432_100, favorite: false }
]

export const SEED_STOCKS: Stock[] = STOCK_UNIVERSE.slice(0, 6)
