import { useEffect, useState } from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { Candle } from '../../../shared/types'
import { won } from '../lib/format'

type Timeframe = 'intraday' | 'daily'

export default function StockChart({ code }: { code: string }) {
  const [tf, setTf] = useState<Timeframe>('intraday')
  const [data, setData] = useState<Candle[]>([])

  useEffect(() => {
    let alive = true
    setData([])
    const p = tf === 'intraday' ? window.tickly.chart.intraday(code) : window.tickly.chart.daily(code, 60)
    p.then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [code, tf])

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(['intraday', 'daily'] as Timeframe[]).map((t) => (
          <button
            key={t}
            onClick={() => setTf(t)}
            className={`px-2.5 py-1 text-xs rounded-md ${
              tf === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t === 'intraday' ? '당일' : '60일'}
          </button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="h-64 grid place-items-center text-sm text-gray-400">차트 로딩…</div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => (tf === 'daily' ? d.slice(5) : d)}
              minTickGap={40}
              fontSize={11}
              stroke="#94a3b8"
            />
            <YAxis yAxisId="price" domain={['auto', 'auto']} tickFormatter={won} fontSize={11} width={56} stroke="#94a3b8" />
            <YAxis yAxisId="vol" orientation="right" hide />
            <Tooltip formatter={(v) => won(Number(v))} />
            <Bar yAxisId="vol" dataKey="volume" name="거래량" fill="#e2e8f0" />
            <Line yAxisId="price" type="monotone" dataKey="close" name="가격" stroke="#4f46e5" dot={false} strokeWidth={1.5} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
