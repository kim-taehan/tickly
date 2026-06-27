import type { QuoteProvider } from './QuoteProvider'
import { naverProvider } from './naverProvider'

// KIS는 키 확보 후 여기에 등록.
const providers: Record<string, QuoteProvider> = {
  naver: naverProvider
}

export function getProvider(name = 'naver'): QuoteProvider {
  return providers[name] ?? naverProvider
}
