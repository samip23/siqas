import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LabelList,
  Cell,
} from 'recharts'

const PALETTE = [
  '#1A3A6B', '#0288D1', '#2E7D32', '#7B1FA2',
  '#E65100', '#00838F', '#AD1457', '#558B2F',
]

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
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#1A2027' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: '#637381' }}>
          {p.name}: <strong style={{ color: '#1A2027' }}>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function AssigneeBarChart({ data = [] }) {
  // Show top 12 assignees max, horizontal bars for readability
  const chartData = data.slice(0, 12)

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 44 + 40)}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 8, right: 48, left: 0, bottom: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#637381' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="assignee"
          width={110}
          tick={{ fontSize: 12, fill: '#1A2027', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,58,107,0.04)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            style={{ fontSize: 11, fontWeight: 700, fill: '#1A2027' }}
          />
        </Bar>
        <Bar dataKey="completed" name="Completed" fill="#2E7D32" radius={[0, 4, 4, 0]} maxBarSize={28}>
          <LabelList
            dataKey="completed"
            position="right"
            style={{ fontSize: 11, fontWeight: 700, fill: '#2E7D32' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
