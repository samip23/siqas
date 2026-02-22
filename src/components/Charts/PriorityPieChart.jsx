import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getPriorityColor } from '../../utils/metrics'

const RADIAN = Math.PI / 180

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.58
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E0E7EF',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      fontSize: 13,
    }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: d.payload.fill }}>{d.name}</p>
      <p style={{ margin: 0, color: '#637381' }}>
        Features: <strong style={{ color: '#1A2027' }}>{d.value}</strong>
      </p>
      <p style={{ margin: 0, color: '#637381' }}>
        Share: <strong style={{ color: '#1A2027' }}>{(d.payload.percent * 100).toFixed(1)}%</strong>
      </p>
    </div>
  )
}

export default function PriorityPieChart({ data = [] }) {
  if (!data.length) return null

  const total = data.reduce((s, d) => s + d.total, 0)
  const chartData = data.map(d => ({
    name: d.priority,
    value: d.total,
    fill: getPriorityColor(d.priority),
    percent: total > 0 ? d.total / total : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={115}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
