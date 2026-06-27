import type { Condition, Metric, Operator } from './types'

export const METRIC_LABELS: Record<Metric, string> = {
  price: '현재가',
  changeRate: '등락률(%)',
  volume: '거래량'
}

export const OPERATOR_LABELS: Record<Operator, string> = {
  gte: '이상',
  lte: '이하'
}

type Metrics = Pick<import('./types').Stock, 'price' | 'changeRate' | 'volume'>

// 순수 함수: 현재 시세가 조건을 충족하는가. 렌더러 배지 + 추후 알림 발화 공용.
export function isConditionMet(m: Metrics, c: Condition): boolean {
  const v = m[c.metric]
  return c.operator === 'gte' ? v >= c.threshold : v <= c.threshold
}

export function conditionLabel(c: Condition): string {
  return `${METRIC_LABELS[c.metric]} ${c.threshold.toLocaleString('ko-KR')} ${OPERATOR_LABELS[c.operator]}`
}
