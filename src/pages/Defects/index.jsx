import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Stack, Grid,
  TextField, MenuItem, Select, Chip, Divider, Alert,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
} from '@mui/material'
import BugReportIcon       from '@mui/icons-material/BugReport'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon   from '@mui/icons-material/DeleteOutline'
import DownloadIcon        from '@mui/icons-material/Download'
import WarningAmberIcon    from '@mui/icons-material/WarningAmber'
import BarChartIcon        from '@mui/icons-material/BarChart'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as ReTooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAuth }            from '../../context/AuthContext'
import { useDefects }         from '../../hooks/useDefects'
import { addDefect, updateDefectStatus, deleteDefect } from '../../services/defectService'
import { DotsPattern }        from '../../components/illustrations/Illustrations'

// ── Colour maps ───────────────────────────────────────────────────────────────
const SEV_COLORS = {
  Critical: { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  High:     { bg: 'rgba(251,146,60,0.14)',  color: '#FB923C', border: 'rgba(251,146,60,0.30)'  },
  Medium:   { bg: 'rgba(245,158,11,0.14)',  color: '#F59E0B', border: 'rgba(245,158,11,0.30)'  },
  Low:      { bg: 'rgba(16,185,129,0.14)',  color: '#10B981', border: 'rgba(16,185,129,0.30)'  },
}
const PRI_COLORS = {
  P1: { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  P2: { bg: 'rgba(251,146,60,0.14)',  color: '#FB923C', border: 'rgba(251,146,60,0.30)'  },
  P3: { bg: 'rgba(245,158,11,0.14)',  color: '#F59E0B', border: 'rgba(245,158,11,0.30)'  },
  P4: { bg: 'rgba(96,165,250,0.14)',  color: '#60A5FA', border: 'rgba(96,165,250,0.30)'  },
}
const STATUS_COLORS = {
  'Open':        { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  'In Progress': { bg: 'rgba(96,165,250,0.14)',  color: '#60A5FA', border: 'rgba(96,165,250,0.30)'  },
  'Resolved':    { bg: 'rgba(16,185,129,0.14)',  color: '#10B981', border: 'rgba(16,185,129,0.30)'  },
  'Closed':      { bg: 'rgba(238,240,255,0.07)', color: '#8891A8', border: 'rgba(238,240,255,0.14)' },
}
function chipFor(map, key) {
  return map[key] ?? { bg: 'rgba(238,240,255,0.07)', color: '#8891A8', border: 'rgba(238,240,255,0.14)' }
}

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']
const PRIORITIES = ['P1', 'P2', 'P3', 'P4']
const STATUSES   = ['Open', 'In Progress', 'Resolved', 'Closed']

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(defects) {
  const headers = ['Title', 'Severity', 'Priority', 'Assigned To', 'Due Date', 'Status', 'Description', 'Reported By', 'Created At']
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = defects.map(d => [
    d.title, d.severity, d.priority, d.assignedTo ?? '',
    d.dueDate     ? d.dueDate.toLocaleDateString()   : '',
    d.status, d.description ?? '', d.createdBy ?? '',
    d.createdAt   ? d.createdAt.toLocaleDateString() : '',
  ].map(esc).join(','))
  const csv  = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `defects_${Date.now()}.csv`
  a.click(); URL.revokeObjectURL(url)
}

// ── Dark chart tooltip ─────────────────────────────────────────────────────────
function DarkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <Box sx={{
      bgcolor: '#1E2235', border: '1px solid rgba(238,240,255,0.10)',
      borderRadius: 2, px: 1.5, py: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.50)',
    }}>
      <Typography sx={{ color: entry.payload?.color ?? '#EEF0FF', fontWeight: 700, fontSize: '0.82rem' }}>
        {entry.name}: <span style={{ color: '#EEF0FF' }}>{entry.value}</span>
      </Typography>
    </Box>
  )
}

// ── Summary charts ────────────────────────────────────────────────────────────
function DefectCharts({ defects }) {
  const sevData = [
    { name: 'Critical', value: defects.filter(d => d.severity === 'Critical').length, color: '#F87171' },
    { name: 'High',     value: defects.filter(d => d.severity === 'High').length,     color: '#FB923C' },
    { name: 'Medium',   value: defects.filter(d => d.severity === 'Medium').length,   color: '#F59E0B' },
    { name: 'Low',      value: defects.filter(d => d.severity === 'Low').length,      color: '#10B981' },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'Open',        value: defects.filter(d => d.status === 'Open').length,        color: '#F87171' },
    { name: 'In Progress', value: defects.filter(d => d.status === 'In Progress').length, color: '#60A5FA' },
    { name: 'Resolved',    value: defects.filter(d => d.status === 'Resolved').length,    color: '#10B981' },
    { name: 'Closed',      value: defects.filter(d => d.status === 'Closed').length,      color: '#8891A8' },
  ].filter(d => d.value > 0)

  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.07) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '0.70rem', fontWeight: 700 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (defects.length === 0) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        Log your first defect to see charts here.
      </Typography>
    </Box>
  )

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}>
          Severity Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={sevData} cx="50%" cy="50%"
              innerRadius={50} outerRadius={75} paddingAngle={3}
              dataKey="value" labelLine={false} label={renderLabel}>
              {sevData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
            </Pie>
            <ReTooltip content={<DarkTooltip />} />
            <Legend iconType="circle" iconSize={7}
              formatter={v => <span style={{ color: '#8891A8', fontSize: '0.75rem' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Divider />

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}>
          Status Breakdown
        </Typography>
        <ResponsiveContainer width="100%" height={Math.max(90, statusData.length * 38)}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 8, right: 36, top: 2, bottom: 2 }}>
            <XAxis type="number" allowDecimals={false}
              tick={{ fill: '#8891A8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90}
              tick={{ fill: '#8891A8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <ReTooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(238,240,255,0.04)' }} />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={20}
              label={{ position: 'right', fill: '#8891A8', fontSize: 11 }}>
              {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const INIT = { title: '', severity: 'High', priority: 'P2', assignedTo: '', dueDate: '', description: '' }

export default function Defects() {
  const { currentUser }           = useAuth()
  const { defects, loading }      = useDefects()
  const [form, setForm]           = useState(INIT)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    setFormError(''); setSubmitting(true)
    try { await addDefect(currentUser, form); setForm(INIT) }
    catch (err) { setFormError(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleStatusChange(id, status) {
    try { await updateDefectStatus(id, status) } catch {}
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteDefect(deleteTarget) } catch {}
    finally { setDeleting(false); setDeleteTarget(null) }
  }

  const openCount     = defects.filter(d => d.status === 'Open').length
  const criticalCount = defects.filter(d => d.severity === 'Critical').length
  const resolvedCount = defects.filter(d => d.status === 'Resolved' || d.status === 'Closed').length

  return (
    <Box maxWidth={1200} mx="auto" pb={5}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative', overflow: 'hidden', borderRadius: 4, mb: 3,
        background: 'linear-gradient(135deg, #0D0F18 0%, #1E0E14 55%, #280F18 100%)',
        border: '1px solid rgba(248,113,113,0.18)',
        p: { xs: 3, sm: 4 },
      }}>
        <DotsPattern color="#FFFFFF" opacity={0.04} cols={18} rows={4} gap={24} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Box sx={{ bgcolor: 'rgba(248,113,113,0.22)', borderRadius: '6px', px: 1.25, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <BugReportIcon sx={{ color: '#FCA5A5', fontSize: 13 }} />
              <Typography sx={{ color: '#FCA5A5', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                Defect Tracker
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.75rem' }, letterSpacing: '-0.3px', mb: 0.5, fontFamily: '"Syne",sans-serif' }}>
            Defect Management
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.875rem' }}>
            Log, track, and resolve software defects in real-time across your QA team.
          </Typography>
        </Box>
      </Box>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Defects',      value: defects.length, color: '#EEF0FF', bg: 'rgba(238,240,255,0.08)' },
          { label: 'Open',               value: openCount,      color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
          { label: 'Critical',           value: criticalCount,  color: '#FB923C', bg: 'rgba(251,146,60,0.12)'  },
          { label: 'Resolved / Closed',  value: resolvedCount,  color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Card>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <Typography sx={{ color: stat.color, fontWeight: 900, fontSize: '1rem' }}>
                    {loading ? '…' : stat.value}
                  </Typography>
                </Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.08em', display: 'block', lineHeight: 1.4 }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Form + Charts ─────────────────────────────────────────────────── */}
      <Grid container spacing={3} mb={3}>

        {/* Add defect form */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Box sx={{ bgcolor: 'rgba(248,113,113,0.18)', borderRadius: '8px', p: 0.75, display: 'flex' }}>
                  <AddCircleOutlineIcon sx={{ color: '#FCA5A5', fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Log New Defect</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                Fill in the fields below to add a defect to the tracker.
              </Typography>

              {formError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>{formError}</Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Title" value={form.title} onChange={set('title')}
                    required fullWidth placeholder="e.g. Login button unresponsive on Safari"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField select label="Severity" value={form.severity} onChange={set('severity')} fullWidth>
                        {SEVERITIES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField select label="Priority" value={form.priority} onChange={set('priority')} fullWidth>
                        {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Assigned To" value={form.assignedTo} onChange={set('assignedTo')}
                        fullWidth placeholder="e.g. Alice"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Due Date" type="date" value={form.dueDate} onChange={set('dueDate')}
                        fullWidth InputLabelProps={{ shrink: true }}
                        sx={{
                          '& input[type="date"]::-webkit-calendar-picker-indicator': {
                            filter: 'invert(0.6)', cursor: 'pointer',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Description" value={form.description} onChange={set('description')}
                    fullWidth multiline rows={3}
                    placeholder="Steps to reproduce, expected vs actual behaviour…"
                  />

                  <Button
                    type="submit" variant="contained" size="large"
                    disabled={submitting} startIcon={!submitting && <BugReportIcon />}
                    sx={{
                      alignSelf: 'flex-start',
                      background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                      boxShadow: '0 2px 12px rgba(220,38,38,0.35)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        boxShadow: '0 4px 24px rgba(220,38,38,0.50)',
                      },
                      '&:disabled': { opacity: 0.5, color: 'white' },
                    }}
                  >
                    {submitting ? 'Logging…' : 'Log Defect'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Box sx={{ bgcolor: 'rgba(129,140,248,0.18)', borderRadius: '8px', p: 0.75, display: 'flex' }}>
                  <BarChartIcon sx={{ color: '#A5B4FC', fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Summary Charts</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Live overview of defect severity and resolution status.
              </Typography>
              <DefectCharts defects={defects} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Defect list ───────────────────────────────────────────────────── */}
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box px={3} py={2.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Defect List</Typography>
                <Typography variant="caption" color="text.secondary">
                  {defects.length} defect{defects.length !== 1 ? 's' : ''} · update status inline · overdue dates shown in red
                </Typography>
              </Box>
              <Button
                variant="outlined" size="small" startIcon={<DownloadIcon />}
                onClick={() => exportCSV(defects)} disabled={defects.length === 0}
              >
                Export CSV
              </Button>
            </Stack>
          </Box>

          {loading ? (
            <Box p={5} display="flex" justifyContent="center">
              <CircularProgress size={28} sx={{ color: '#F87171' }} />
            </Box>
          ) : defects.length === 0 ? (
            <Box p={6} textAlign="center">
              <BugReportIcon sx={{ fontSize: 44, color: '#3D4458', mb: 1.5 }} />
              <Typography color="text.disabled">No defects logged yet. Use the form above to add one.</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{
                width: '100%', borderCollapse: 'collapse',
                '& th': {
                  textAlign: 'left', py: 1.5, px: 2, bgcolor: '#1A1E2C',
                  fontWeight: 800, fontSize: '0.68rem', color: '#8891A8',
                  borderBottom: '2px solid', borderColor: 'divider',
                  letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                },
                '& td': { py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider', verticalAlign: 'middle' },
                '& tr:last-child td': { border: 0 },
                '& tbody tr:hover td': { bgcolor: 'rgba(238,240,255,0.02)' },
              }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {defects.map(d => {
                    const sev     = chipFor(SEV_COLORS,    d.severity)
                    const pri     = chipFor(PRI_COLORS,    d.priority)
                    const st      = chipFor(STATUS_COLORS, d.status)
                    const overdue = d.dueDate && d.dueDate < new Date()
                      && d.status !== 'Resolved' && d.status !== 'Closed'
                    return (
                      <tr key={d.id}>
                        <td style={{ maxWidth: 280 }}>
                          <Typography fontWeight={600} fontSize="0.875rem"
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                            {d.title}
                          </Typography>
                          {d.description && (
                            <Typography fontSize="0.75rem" color="text.secondary"
                              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260, mt: 0.25 }}>
                              {d.description}
                            </Typography>
                          )}
                        </td>
                        <td>
                          <Chip label={d.severity} size="small"
                            sx={{ bgcolor: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, fontWeight: 700, fontSize: '0.68rem' }} />
                        </td>
                        <td>
                          <Chip label={d.priority} size="small"
                            sx={{ bgcolor: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, fontWeight: 700, fontSize: '0.68rem' }} />
                        </td>
                        <td>
                          <Typography fontSize="0.82rem" color={d.assignedTo ? 'text.primary' : 'text.disabled'}>
                            {d.assignedTo || '—'}
                          </Typography>
                        </td>
                        <td>
                          <Typography fontSize="0.82rem"
                            sx={{ color: overdue ? '#F87171' : 'text.secondary', fontWeight: overdue ? 600 : 400 }}>
                            {d.dueDate ? d.dueDate.toLocaleDateString() : '—'}
                            {overdue && ' ⚠'}
                          </Typography>
                        </td>
                        <td style={{ minWidth: 148 }}>
                          <Select
                            value={d.status}
                            onChange={e => handleStatusChange(d.id, e.target.value)}
                            size="small"
                            sx={{
                              fontSize: '0.78rem', fontWeight: 700,
                              color: st.color, bgcolor: st.bg,
                              border: `1px solid ${st.border}`, borderRadius: '6px',
                              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                              '.MuiSelect-icon': { color: st.color },
                              minWidth: 134,
                            }}
                          >
                            {STATUSES.map(s => (
                              <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>{s}</MenuItem>
                            ))}
                          </Select>
                        </td>
                        <td>
                          <Tooltip title="Delete defect">
                            <IconButton size="small" onClick={() => setDeleteTarget(d.id)}
                              sx={{ color: 'rgba(238,240,255,0.22)', '&:hover': { color: '#F87171', bgcolor: 'rgba(248,113,113,0.10)' } }}>
                              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Delete confirmation dialog ─────────────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon sx={{ color: 'warning.main' }} />
            <span>Delete Defect?</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the defect from the tracker. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error"
            disabled={deleting} startIcon={<DeleteOutlineIcon />}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
