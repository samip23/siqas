import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E0E7EF',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      fontSize: 13,
    }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#1A2027' }}>Week of {label}</p>
      <p style={{ margin: 0, color: '#2E7D32' }}>
        Completions: <strong>{payload[0].value}</strong>
      </p>
    </div>
  )
}

const CustomDot = ({ cx, cy, value }) => {
  if (!value) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#2E7D32" stroke="#fff" strokeWidth={2} />
    </g>
  )
}

export default function CompletionTrendChart({ data = [] }) {
  if (!data.length) return null

  const avg = Math.round(data.reduce((s, d) => s + d.count, 0) / data.length)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#637381', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#637381' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        {avg > 0 && (
          <ReferenceLine
            y={avg}
            stroke="#0288D1"
            strokeDasharray="5 4"
            label={{
              value: `Avg: ${avg}`,
              position: 'insideTopRight',
              fontSize: 11,
              fontWeight: 700,
              fill: '#0288D1',
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="count"
          name="Completions"
          stroke="#2E7D32"
          strokeWidth={2.5}
          fill="url(#trendGradient)"
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: '#2E7D32', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
