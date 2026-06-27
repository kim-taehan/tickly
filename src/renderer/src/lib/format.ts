// 한국 관례: 상승=빨강, 하락=파랑, 보합=회색
export function rateColor(rate: number): string {
  if (rate > 0) return 'text-red-600'
  if (rate < 0) return 'text-blue-600'
  return 'text-gray-500'
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}

export const won = (n: number): string => n.toLocaleString('ko-KR')
