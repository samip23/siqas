import { useState, useRef } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Stack, Grid,
  Chip, Divider, Alert, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Collapse, Tooltip,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import ReplayIcon from '@mui/icons-material/Replay'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { parseRequirementsCSV } from '../../services/requirementParser'
import { DotsPattern } from '../../components/illustrations/Illustrations'

// ── States ────────────────────────────────────────────────────────────────────
const S = { IDLE: 'IDLE', PARSED: 'PARSED', GENERATING: 'GENERATING', DONE: 'DONE', ERROR: 'ERROR' }

// ── Colour maps ───────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  High:   { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  Medium: { bg: 'rgba(245,158,11,0.14)',  color: '#F59E0B', border: 'rgba(245,158,11,0.30)'  },
  Low:    { bg: 'rgba(16,185,129,0.14)',  color: '#10B981', border: 'rgba(16,185,129,0.30)'  },
}
const TYPE_COLORS = {
  Functional:  { bg: 'rgba(96,165,250,0.12)',  color: '#60A5FA', border: 'rgba(96,165,250,0.28)'  },
  Negative:    { bg: 'rgba(248,113,113,0.12)', color: '#F87171', border: 'rgba(248,113,113,0.28)' },
  'Edge Case': { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: 'rgba(167,139,250,0.28)' },
  Integration: { bg: 'rgba(14,165,233,0.12)',  color: '#38BDF8', border: 'rgba(14,165,233,0.28)'  },
}
function colorFor(map, key) {
  return map[key] ?? { bg: 'rgba(238,240,255,0.07)', color: '#8891A8', border: 'rgba(238,240,255,0.14)' }
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile, disabled }) {
  const inputRef = useRef()
  const [over, setOver] = useState(false)

  function pick(file) {
    if (!file || !file.name.endsWith('.csv')) return
    onFile(file)
  }

  return (
    <Box
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]) }}
      sx={{
        border: `2px dashed`,
        borderColor: over ? '#818CF8' : 'rgba(238,240,255,0.15)',
        borderRadius: 3, p: { xs: 4, sm: 6 }, textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: over ? 'rgba(129,140,248,0.06)' : 'rgba(238,240,255,0.02)',
        transition: 'all 0.18s ease',
        '&:hover': disabled ? {} : { borderColor: '#818CF8', bgcolor: 'rgba(129,140,248,0.04)' },
      }}
    >
      <input ref={inputRef} type="file" accept=".csv" hidden onChange={e => pick(e.target.files[0])} />
      <UploadFileIcon sx={{ fontSize: 48, color: over ? '#818CF8' : 'rgba(238,240,255,0.25)', mb: 1.5, transition: 'color 0.18s' }} />
      <Typography variant="h6" fontWeight={700} color={over ? 'secondary' : 'text.primary'} mb={0.5}>
        Drop your requirements CSV here
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        or click to browse — accepts .csv files
      </Typography>
      <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} disabled={disabled}
        onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
        Choose File
      </Button>
    </Box>
  )
}

// ── Test Case Detail Dialog ───────────────────────────────────────────────────
function DetailDialog({ tc, onClose }) {
  if (!tc) return null
  const p = colorFor(PRIORITY_COLORS, tc.priority)
  const t = colorFor(TYPE_COLORS, tc.type)
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          <Typography fontWeight={800} fontSize="1rem">{tc.id}</Typography>
          <Typography fontWeight={600} color="text.secondary" fontSize="0.875rem" flex={1}>{tc.name}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={tc.priority} size="small"
            sx={{ bgcolor: p.bg, color: p.color, border: `1px solid ${p.border}`, fontWeight: 700, fontSize: '0.70rem' }} />
          <Chip label={tc.type} size="small"
            sx={{ bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 700, fontSize: '0.70rem' }} />
          {tc.requirementId && (
            <Chip label={`Req: ${tc.requirementId}`} size="small" variant="outlined"
              sx={{ fontSize: '0.70rem', fontWeight: 600, color: 'text.secondary' }} />
          )}
        </Stack>
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" color="primary" mb={0.5}>Description</Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>{tc.description}</Typography>

        <Typography variant="subtitle2" color="primary" mb={1}>Test Steps</Typography>
        <Box component="ol" sx={{ pl: 2.5, m: 0 }}>
          {(tc.steps ?? []).map((step, i) => (
            <Box component="li" key={i} sx={{ mb: 0.75 }}>
              <Typography variant="body2">{step.replace(/^step\s*\d+[:.]\s*/i, '')}</Typography>
            </Box>
          ))}
        </Box>

        <Box mt={2.5} p={2} sx={{ bgcolor: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#10B981' }} mb={0.5}>Expected Result</Typography>
          <Typography variant="body2" color="text.primary">{tc.expectedResult}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Requirements preview table ─────────────────────────────────────────────────
function RequirementsTable({ requirements }) {
  const hasTitle    = requirements.some(r => r.title)
  const hasPriority = requirements.some(r => r.priority)
  const hasCategory = requirements.some(r => r.category)

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem',
        '& th': { textAlign: 'left', py: 1.25, px: 2, bgcolor: '#1A1E2C', fontWeight: 800,
          fontSize: '0.68rem', color: '#8891A8', borderBottom: '2px solid', borderColor: 'divider',
          letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
        '& td': { py: 1.25, px: 2, borderBottom: '1px solid', borderColor: 'divider', verticalAlign: 'top' },
        '& tr:last-child td': { border: 0 },
        '& tbody tr:hover td': { bgcolor: 'rgba(238,240,255,0.03)' },
      }}>
        <thead>
          <tr>
            <th>ID</th>
            {hasTitle    && <th>Title</th>}
            <th>Description</th>
            {hasPriority && <th>Priority</th>}
            {hasCategory && <th>Category</th>}
          </tr>
        </thead>
        <tbody>
          {requirements.map(r => (
            <tr key={r.id}>
              <td><Typography fontWeight={700} fontSize="0.82rem" sx={{ whiteSpace: 'nowrap' }}>{r.id}</Typography></td>
              {hasTitle    && <td><Typography fontSize="0.82rem" fontWeight={600}>{r.title}</Typography></td>}
              <td><Typography fontSize="0.82rem" color="text.secondary"
                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {r.description}
              </Typography></td>
              {hasPriority && <td>{r.priority && <Chip label={r.priority} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 20 }} />}</td>}
              {hasCategory && <td><Typography fontSize="0.78rem" color="text.secondary">{r.category}</Typography></td>}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}

// ── Test Cases table ──────────────────────────────────────────────────────────
function TestCasesTable({ testCases, onSelect }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box component="table" sx={{
        width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem',
        '& th': { textAlign: 'left', py: 1.5, px: 2.5, bgcolor: '#1A1E2C', fontWeight: 800,
          fontSize: '0.70rem', color: '#8891A8', borderBottom: '2px solid', borderColor: 'divider',
          letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
        '& td': { py: 1.5, px: 2.5, borderBottom: '1px solid', borderColor: 'divider', verticalAlign: 'middle' },
        '& tr:last-child td': { border: 0 },
        '& tbody tr:hover td': { bgcolor: 'rgba(238,240,255,0.03)', cursor: 'pointer' },
      }}>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Req ID</th>
            <th>Test Case Name</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Type</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {testCases.map(tc => {
            const p = colorFor(PRIORITY_COLORS, tc.priority)
            const t = colorFor(TYPE_COLORS, tc.type)
            return (
              <tr key={tc.id} onClick={() => onSelect(tc)}>
                <td>
                  <Typography fontWeight={800} fontSize="0.82rem" color="primary">{tc.id}</Typography>
                </td>
                <td>
                  <Typography fontSize="0.78rem" color="text.secondary" fontWeight={600}>{tc.requirementId ?? '—'}</Typography>
                </td>
                <td>
                  <Typography fontWeight={600} fontSize="0.875rem">{tc.name}</Typography>
                </td>
                <td>
                  <Typography fontSize="0.82rem" color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 320 }}>
                    {tc.description}
                  </Typography>
                </td>
                <td>
                  <Chip label={tc.priority} size="small"
                    sx={{ bgcolor: p.bg, color: p.color, border: `1px solid ${p.border}`, fontWeight: 700, fontSize: '0.68rem' }} />
                </td>
                <td>
                  <Chip label={tc.type} size="small"
                    sx={{ bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 700, fontSize: '0.68rem' }} />
                </td>
                <td>
                  <Tooltip title="View full details">
                    <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={e => { e.stopPropagation(); onSelect(tc) }}>
                      <OpenInFullIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Box>
    </Box>
  )
}

// ── CSV Download helper ───────────────────────────────────────────────────────
function downloadCSV(testCases) {
  const headers = ['Test ID', 'Requirement ID', 'Name', 'Description', 'Steps', 'Expected Result', 'Priority', 'Type']
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = testCases.map(tc => [
    tc.id, tc.requirementId, tc.name, tc.description,
    (tc.steps ?? []).join(' | '), tc.expectedResult, tc.priority, tc.type,
  ].map(escape).join(','))
  const csv = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `test_cases_${Date.now()}.csv`
  a.click(); URL.revokeObjectURL(url)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TestGenerator() {
  const [phase, setPhase]           = useState(S.IDLE)
  const [fileName, setFileName]     = useState('')
  const [requirements, setRequirements] = useState([])
  const [warnings, setWarnings]     = useState([])
  const [testCases, setTestCases]   = useState([])
  const [errorMsg, setErrorMsg]     = useState('')
  const [selected, setSelected]     = useState(null)
  const [showWarnings, setShowWarnings] = useState(false)

  async function handleFile(file) {
    setFileName(file.name)
    setErrorMsg('')
    try {
      const { requirements: reqs, warnings: w } = await parseRequirementsCSV(file)
      setRequirements(reqs)
      setWarnings(w)
      setPhase(S.PARSED)
    } catch (err) {
      setErrorMsg(err.message)
      setPhase(S.ERROR)
    }
  }

  async function handleGenerate() {
    setPhase(S.GENERATING)
    setErrorMsg('')
    try {
      const res = await fetch('/.netlify/functions/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed.')
      setTestCases(data.testCases)
      setPhase(S.DONE)
    } catch (err) {
      setErrorMsg(err.message)
      setPhase(S.ERROR)
    }
  }

  function reset() {
    setPhase(S.IDLE); setFileName(''); setRequirements([])
    setWarnings([]); setTestCases([]); setErrorMsg(''); setSelected(null)
  }

  // ── Stat helpers ──────────────────────────────────────────────────────────
  const countBy = (arr, key, val) => arr.filter(tc => tc[key] === val).length

  return (
    <Box maxWidth={1200} mx="auto" pb={5}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative', overflow: 'hidden', borderRadius: 4, mb: 3.5,
        background: 'linear-gradient(135deg, #1E0A5C 0%, #4C1D95 50%, #6D28D9 100%)',
        p: { xs: 3, sm: 4 },
      }}>
        <DotsPattern color="#FFFFFF" opacity={0.04} cols={20} rows={4} gap={24} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Box sx={{ bgcolor: 'rgba(167,139,250,0.25)', borderRadius: '6px', px: 1.25, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AutoAwesomeIcon sx={{ color: '#C4B5FD', fontSize: 13 }} />
                  <Typography sx={{ color: '#C4B5FD', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                    AI-Powered
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.75rem' }, letterSpacing: '-0.3px', mb: 0.5, fontFamily: '"Syne",sans-serif' }}>
                Test Case Generator
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
                Upload your business requirements CSV and let AI generate comprehensive test cases instantly
              </Typography>
            </Box>

            {phase === S.DONE && (
              <Button variant="contained" startIcon={<DownloadIcon />}
                onClick={() => downloadCSV(testCases)}
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)',
                  color: 'white', backdropFilter: 'blur(12px)', flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}>
                Download CSV
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {phase === S.ERROR && (
        <Alert severity="error" sx={{ mb: 3 }}
          action={<Button size="small" color="inherit" startIcon={<ReplayIcon />} onClick={reset}>Start over</Button>}>
          {errorMsg}
        </Alert>
      )}

      {/* ── IDLE: upload zone + info ──────────────────────────────────────── */}
      {phase === S.IDLE && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>Upload Requirements CSV</Typography>
                <Typography variant="body2" color="text.secondary" mb={2.5}>
                  The CSV should have at minimum an ID column and a Description column.
                </Typography>
                <DropZone onFile={handleFile} disabled={false} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <InfoOutlinedIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700}>Supported Columns</Typography>
                </Stack>
                <Stack spacing={1.25}>
                  {[
                    { name: 'Req ID', aliases: 'id, requirement id, req #', required: true },
                    { name: 'Description', aliases: 'description, details, requirement', required: true },
                    { name: 'Title', aliases: 'title, name, summary', required: false },
                    { name: 'Priority', aliases: 'priority, severity', required: false },
                    { name: 'Category', aliases: 'category, module, area', required: false },
                  ].map(col => (
                    <Box key={col.name} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Chip label={col.required ? 'Required' : 'Optional'} size="small"
                        sx={{ fontSize: '0.60rem', fontWeight: 700, height: 18, mt: '1px', flexShrink: 0,
                          bgcolor: col.required ? 'rgba(248,113,113,0.14)' : 'rgba(238,240,255,0.08)',
                          color: col.required ? '#F87171' : '#8891A8' }} />
                      <Box>
                        <Typography fontSize="0.82rem" fontWeight={700}>{col.name}</Typography>
                        <Typography fontSize="0.72rem" color="text.secondary">{col.aliases}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                  Generated test cases include:
                </Typography>
                {['Happy path scenarios', 'Negative / invalid input', 'Edge & boundary cases', 'Steps + expected results', 'Priority & type labels'].map(item => (
                  <Stack key={item} direction="row" alignItems="center" spacing={0.75} mb={0.5}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: '#059669' }} />
                    <Typography variant="caption" color="text.secondary">{item}</Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── PARSED: requirements preview ──────────────────────────────────── */}
      {phase === S.PARSED && (
        <Stack spacing={3}>
          {warnings.length > 0 && (
            <Alert severity="warning" icon={<WarningAmberIcon />}
              action={<Button size="small" color="inherit" onClick={() => setShowWarnings(v => !v)}>
                {showWarnings ? 'Hide' : `Show ${warnings.length}`}
              </Button>}>
              {warnings.length} row{warnings.length !== 1 ? 's' : ''} skipped during parsing.
              <Collapse in={showWarnings}>
                <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                  {warnings.map((w, i) => <li key={i}><Typography variant="caption">{w}</Typography></li>)}
                </Box>
              </Collapse>
            </Alert>
          )}

          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box px={3} py={2.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Requirements Preview</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} parsed from <strong>{fileName}</strong>
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button variant="outlined" size="small" startIcon={<ReplayIcon />} onClick={reset}>
                      Change file
                    </Button>
                    <Button variant="contained" size="large" startIcon={<AutoAwesomeIcon />}
                      onClick={handleGenerate}
                      sx={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)',
                        boxShadow: '0 2px 12px rgba(109,40,217,0.40)',
                        '&:hover': { background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 100%)' } }}>
                      Generate Test Cases
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <RequirementsTable requirements={requirements} />
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* ── GENERATING: loading ───────────────────────────────────────────── */}
      {phase === S.GENERATING && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4C1D95, #6D28D9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
              <AutoAwesomeIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} mb={0.75}>AI is generating test cases…</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Analysing {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} and creating comprehensive test scenarios
            </Typography>
            <LinearProgress sx={{ maxWidth: 320, mx: 'auto', borderRadius: 99,
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6D28D9, #0EA5E9)' } }} />
          </CardContent>
        </Card>
      )}

      {/* ── DONE: results ─────────────────────────────────────────────────── */}
      {phase === S.DONE && (
        <Stack spacing={3}>
          {/* Stats bar */}
          <Grid container spacing={2}>
            {[
              { label: 'Test Cases Generated', value: testCases.length, color: '#A78BFA', bg: 'rgba(167,139,250,0.14)' },
              { label: 'High Priority', value: countBy(testCases, 'priority', 'High'), color: '#F87171', bg: 'rgba(248,113,113,0.14)' },
              { label: 'Functional Tests', value: countBy(testCases, 'type', 'Functional'), color: '#60A5FA', bg: 'rgba(96,165,250,0.14)' },
              { label: 'Negative / Edge Cases', value: countBy(testCases, 'type', 'Negative') + countBy(testCases, 'type', 'Edge Case'), color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
            ].map(stat => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                      <Typography sx={{ color: stat.color, fontWeight: 900, fontSize: '1rem' }}>{stat.value}</Typography>
                    </Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.08em', display: 'block', lineHeight: 1.4 }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Table */}
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box px={3} py={2.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Generated Test Cases</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click any row to view full details — steps and expected results
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" startIcon={<ReplayIcon />} onClick={reset}>
                      New file
                    </Button>
                    <Button variant="contained" size="small" startIcon={<DownloadIcon />}
                      onClick={() => downloadCSV(testCases)}
                      sx={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)' }}>
                      Download CSV
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <TestCasesTable testCases={testCases} onSelect={setSelected} />
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Detail dialog */}
      {selected && <DetailDialog tc={selected} onClose={() => setSelected(null)} />}
    </Box>
  )
}
