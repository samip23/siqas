import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { useTheme } from '@mui/material'

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
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.fill ?? p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function SprintBarChart({ data = [] }) {
  const theme = useTheme()

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" vertical={false} />
        <XAxis
          dataKey="sprint"
          tick={{ fontSize: 12, fill: '#637381', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#637381' }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,58,107,0.04)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="total" name="Total" fill="#1A3A6B" radius={[4, 4, 0, 0]} maxBarSize={52}>
          <LabelList dataKey="total" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#1A3A6B' }} />
        </Bar>
        <Bar dataKey="completed" name="Completed" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={52}>
          <LabelList dataKey="completed" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#2E7D32' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
