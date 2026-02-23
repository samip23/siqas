import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip, LinearProgress,
  CircularProgress, Collapse, Select, Alert, Snackbar,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { useAuth } from '../../context/AuthContext'
import { useTestPlans } from '../../hooks/useTestPlans'
import { useFeatures } from '../../hooks/useFeatures'
import {
  createPlan, deletePlan, addTestCase, addTestCasesBatch,
  updateCaseStatus, deleteTestCase, subscribeToTestCases,
} from '../../services/testPlanService'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  'Not Run': { bg: 'rgba(238,240,255,0.08)', color: '#8891A8', border: 'rgba(238,240,255,0.15)' },
  'Pass':    { bg: 'rgba(16,185,129,0.14)',  color: '#10B981', border: 'rgba(16,185,129,0.30)'  },
  'Fail':    { bg: 'rgba(248,113,113,0.14)', color: '#F87171', border: 'rgba(248,113,113,0.30)' },
  'Blocked': { bg: 'rgba(245,158,11,0.14)',  color: '#F59E0B', border: 'rgba(245,158,11,0.30)'  },
}

const PRIORITY_STYLES = {
  High:   { bg: 'rgba(248,113,113,0.12)', color: '#F87171' },
  Medium: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  Low:    { bg: 'rgba(129,140,248,0.12)', color: '#818CF8' },
}

const TYPE_STYLES = {
  Functional:   { bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  Negative:     { bg: 'rgba(248,113,113,0.12)', color: '#F87171' },
  'Edge Case':  { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  Integration:  { bg: 'rgba(129,140,248,0.12)', color: '#818CF8' },
}

const MANUAL_INIT = { name: '', type: 'Functional', priority: 'Medium', steps: '', expectedResult: '' }

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES['Not Run']
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`,
        fontWeight: 600, fontSize: '0.72rem',
      }}
    />
  )
}

function MiniChip({ label, styles }) {
  const s = styles ?? { bg: 'rgba(238,240,255,0.08)', color: '#8891A8' }
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.70rem' }}
    />
  )
}

// ── Plan Detail ───────────────────────────────────────────────────────────────

function PlanDetail({ plan, onBack, generatedCases, currentUser }) {
  const [testCases,    setTestCases]    = useState([])
  const [tcLoading,    setTcLoading]    = useState(true)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showManual,   setShowManual]   = useState(false)
  const [manualForm,   setManualForm]   = useState(MANUAL_INIT)
  const [submitting,   setSubmitting]   = useState(false)
  const [importing,    setImporting]    = useState(false)
  const [snackMsg,     setSnackMsg]     = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const unsub = subscribeToTestCases(plan.id, data => {
      setTestCases(data)
      setTcLoading(false)
    })
    return unsub
  }, [plan.id])

  const total    = testCases.length
  const passCount    = testCases.filter(t => t.status === 'Pass').length
  const failCount    = testCases.filter(t => t.status === 'Fail').length
  const blockedCount = testCases.filter(t => t.status === 'Blocked').length
  const notRunCount  = testCases.filter(t => t.status === 'Not Run').length
  const pct = total ? Math.round((passCount / total) * 100) : 0

  function toggleRow(id) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleStatusChange(tc, status) {
    await updateCaseStatus(plan.id, tc.id, status)
  }

  async function handleDeleteCase(tc) {
    await deleteTestCase(plan.id, tc.id)
    setDeleteTarget(null)
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualForm.name.trim()) return
    setSubmitting(true)
    try {
      await addTestCase(plan.id, currentUser, {
        ...manualForm,
        steps: manualForm.steps.split('\n').map(s => s.trim()).filter(Boolean),
        source: 'manual',
      })
      setManualForm(MANUAL_INIT)
      setShowManual(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImport() {
    if (!generatedCases.length) return
    setImporting(true)
    try {
      await addTestCasesBatch(plan.id, currentUser, generatedCases)
      setSnackMsg(`${generatedCases.length} test case${generatedCases.length > 1 ? 's' : ''} imported`)
    } finally {
      setImporting(false)
    }
  }

  const setM = key => e => setManualForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={onBack} sx={{ color: '#8891A8', '&:hover': { color: '#EEF0FF' } }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{
          fontFamily: '"Syne",sans-serif', fontWeight: 800,
          fontSize: { xs: '1.3rem', sm: '1.6rem' }, color: '#EEF0FF', flex: 1,
        }}>
          {plan.name}
        </Typography>
        <Chip
          label={`Sprint ${plan.sprintNumber}`}
          sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.30)', fontWeight: 700 }}
        />
      </Box>

      {/* Stat bar */}
      <Box sx={{
        display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2,
        bgcolor: '#141720', borderRadius: 2, p: 2,
        border: '1px solid rgba(238,240,255,0.08)',
      }}>
        {[
          { label: 'Total',    value: total,        color: '#EEF0FF' },
          { label: 'Pass',     value: passCount,    color: '#10B981' },
          { label: 'Fail',     value: failCount,    color: '#F87171' },
          { label: 'Blocked',  value: blockedCount, color: '#F59E0B' },
          { label: 'Not Run',  value: notRunCount,  color: '#8891A8' },
        ].map(({ label, value, color }) => (
          <Box key={label} sx={{ textAlign: 'center', minWidth: 56 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1.1 }}>{value}</Typography>
            <Typography sx={{ fontSize: '0.70rem', color: 'rgba(238,240,255,0.40)', fontWeight: 600 }}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', ml: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(238,240,255,0.40)' }}>Progress</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>{pct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: 'rgba(238,240,255,0.08)',
              '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 },
            }}
          />
        </Box>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowManual(v => !v)}
          variant="outlined"
          sx={{
            borderColor: 'rgba(238,240,255,0.15)', color: '#EEF0FF',
            fontWeight: 600, borderRadius: '8px',
            '&:hover': { borderColor: '#10B981', color: '#10B981' },
          }}
        >
          Add Manually
        </Button>
        <Tooltip title={!generatedCases.length ? 'Generate test cases in Test Generator first' : ''}>
          <span>
            <Button
              startIcon={importing ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <ChecklistIcon />}
              onClick={handleImport}
              disabled={!generatedCases.length || importing}
              variant="outlined"
              sx={{
                borderColor: 'rgba(16,185,129,0.30)', color: '#10B981',
                fontWeight: 600, borderRadius: '8px',
                '&:hover': { borderColor: '#10B981', bgcolor: 'rgba(16,185,129,0.06)' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              Import from Generator{generatedCases.length ? ` (${generatedCases.length})` : ''}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Manual add form */}
      <Collapse in={showManual}>
        <Box
          component="form"
          onSubmit={handleManualSubmit}
          sx={{
            bgcolor: '#141720', border: '1px solid rgba(16,185,129,0.20)',
            borderRadius: 2, p: 2.5, mb: 2.5,
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}
        >
          <Typography sx={{ color: '#10B981', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            New Test Case
          </Typography>
          <TextField label="Name" value={manualForm.name} onChange={setM('name')} required fullWidth size="small" />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField select label="Type" value={manualForm.type} onChange={setM('type')} size="small" sx={{ minWidth: 150 }}>
              {['Functional', 'Negative', 'Edge Case', 'Integration'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField select label="Priority" value={manualForm.priority} onChange={setM('priority')} size="small" sx={{ minWidth: 120 }}>
              {['High', 'Medium', 'Low'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Box>
          <TextField
            label="Steps (one per line)"
            value={manualForm.steps}
            onChange={setM('steps')}
            multiline rows={3} fullWidth size="small"
            placeholder="Step 1: Navigate to login&#10;Step 2: Enter credentials"
          />
          <TextField
            label="Expected Result"
            value={manualForm.expectedResult}
            onChange={setM('expectedResult')}
            multiline rows={2} fullWidth size="small"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit" variant="contained" disabled={!manualForm.name.trim() || submitting}
              sx={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                fontWeight: 700, borderRadius: '8px',
                '&.Mui-disabled': { opacity: 0.5 },
              }}
            >
              {submitting ? 'Adding…' : 'Add'}
            </Button>
            <Button onClick={() => { setShowManual(false); setManualForm(MANUAL_INIT) }}
              sx={{ color: '#8891A8', borderRadius: '8px' }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Test cases table */}
      {tcLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : testCases.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(238,240,255,0.30)' }}>
          <ChecklistIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.4 }} />
          <Typography>No test cases yet. Add manually or import from the Test Generator.</Typography>
        </Box>
      ) : (
        <Box sx={{ border: '1px solid rgba(238,240,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          {/* Table header */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 90px 130px 44px',
            bgcolor: '#1A1E2C', px: 2, py: 1.25,
            borderBottom: '1px solid rgba(238,240,255,0.08)',
          }}>
            {['Test Case', 'Type', 'Priority', 'Status', ''].map(h => (
              <Typography key={h} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8891A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </Typography>
            ))}
          </Box>

          {testCases.map((tc, idx) => {
            const expanded = expandedRows.has(tc.id)
            const ss = STATUS_STYLES[tc.status] ?? STATUS_STYLES['Not Run']
            return (
              <Box key={tc.id} sx={{ borderBottom: idx < testCases.length - 1 ? '1px solid rgba(238,240,255,0.06)' : 'none' }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px 90px 130px 44px',
                  px: 2, py: 1.25, alignItems: 'center',
                  bgcolor: expanded ? 'rgba(238,240,255,0.02)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(238,240,255,0.03)' },
                }}>
                  {/* Name + expand */}
                  <Box
                    onClick={() => toggleRow(tc.id)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: '#10B981', flexShrink: 0 }} />
                              : <ExpandMoreIcon  sx={{ fontSize: 16, color: '#8891A8', flexShrink: 0 }} />}
                    <Typography sx={{
                      fontSize: '0.88rem', color: '#EEF0FF', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tc.name}
                    </Typography>
                    {tc.source === 'generated' && (
                      <Chip label="AI" size="small" sx={{ fontSize: '0.60rem', height: 16, bgcolor: 'rgba(129,140,248,0.12)', color: '#818CF8', ml: 0.5, flexShrink: 0 }} />
                    )}
                  </Box>

                  <MiniChip label={tc.type} styles={TYPE_STYLES[tc.type]} />
                  <MiniChip label={tc.priority} styles={PRIORITY_STYLES[tc.priority]} />

                  {/* Status dropdown */}
                  <Select
                    value={tc.status}
                    onChange={e => handleStatusChange(tc, e.target.value)}
                    size="small"
                    sx={{
                      fontSize: '0.80rem', fontWeight: 600,
                      color: ss.color,
                      bgcolor: ss.bg,
                      border: `1px solid ${ss.border}`,
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-icon': { color: ss.color },
                    }}
                  >
                    {Object.keys(STATUS_STYLES).map(s => (
                      <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>{s}</MenuItem>
                    ))}
                  </Select>

                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(tc)}
                    sx={{ color: 'rgba(248,113,113,0.40)', '&:hover': { color: '#F87171' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Expanded detail */}
                <Collapse in={expanded}>
                  <Box sx={{ px: 3.5, pb: 2, pt: 0.5, bgcolor: 'rgba(238,240,255,0.015)' }}>
                    {tc.steps?.length > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.73rem', color: '#8891A8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>Steps</Typography>
                        {tc.steps.map((step, i) => (
                          <Typography key={i} sx={{ fontSize: '0.84rem', color: 'rgba(238,240,255,0.65)', mb: 0.4 }}>
                            {step}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    {tc.expectedResult && (
                      <Box sx={{ bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 1.5, p: 1.25 }}>
                        <Typography sx={{ fontSize: '0.73rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>Expected Result</Typography>
                        <Typography sx={{ fontSize: '0.84rem', color: 'rgba(238,240,255,0.70)' }}>{tc.expectedResult}</Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { bgcolor: '#141720', borderRadius: 3, border: '1px solid rgba(238,240,255,0.10)' } }}>
        <DialogTitle sx={{ color: '#EEF0FF', fontWeight: 700 }}>Delete Test Case?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#8891A8' }}>
            "{deleteTarget?.name}" will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#8891A8' }}>Cancel</Button>
          <Button onClick={() => handleDeleteCase(deleteTarget)} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '8px' }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackMsg('')} sx={{ borderRadius: 2, fontWeight: 600 }}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  )
}

// ── Plans List ────────────────────────────────────────────────────────────────

const PLAN_INIT = { name: '', sprintNumber: '', description: '', featureIds: [] }

export default function TestPlans({ generatedCases = [] }) {
  const { currentUser } = useAuth()
  const { plans, loading } = useTestPlans()
  const { features } = useFeatures()

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [planForm,     setPlanForm]      = useState(PLAN_INIT)
  const [creating,     setCreating]      = useState(false)
  const [deleteTarget, setDeleteTarget]  = useState(null)
  const [createError,  setCreateError]   = useState('')

  // Keep selectedPlan in sync with live plans data
  useEffect(() => {
    if (selectedPlan) {
      const updated = plans.find(p => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
    }
  }, [plans]) // eslint-disable-line

  const setP = key => e => setPlanForm(f => ({ ...f, [key]: e.target.value }))
  const toggleFeature = id => setPlanForm(f => ({
    ...f,
    featureIds: f.featureIds.includes(id)
      ? f.featureIds.filter(x => x !== id)
      : [...f.featureIds, id],
  }))

  async function handleCreatePlan() {
    if (!planForm.name.trim() || !planForm.sprintNumber) return
    setCreating(true)
    setCreateError('')
    try {
      await createPlan(currentUser, planForm)
      setPlanForm(PLAN_INIT)
      setDialogOpen(false)
    } catch (err) {
      console.error('createPlan failed:', err)
      setCreateError(err.message ?? 'Failed to create plan. Check console for details.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeletePlan(plan) {
    await deletePlan(plan.id, [])
    setDeleteTarget(null)
    if (selectedPlan?.id === plan.id) setSelectedPlan(null)
  }

  // Group plans by sprint
  const bySpint = plans.reduce((acc, p) => {
    const key = `Sprint ${p.sprintNumber}`
    ;(acc[key] = acc[key] ?? []).push(p)
    return acc
  }, {})

  if (selectedPlan) {
    return (
      <PlanDetail
        plan={selectedPlan}
        onBack={() => setSelectedPlan(null)}
        generatedCases={generatedCases}
        currentUser={currentUser}
      />
    )
  }

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #064E3B 0%, #0a1f18 50%, #0F172A 100%)',
        borderRadius: 3, border: '1px solid rgba(16,185,129,0.20)',
        p: { xs: 3, sm: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(rgba(238,240,255,0.8) 1px, transparent 1px)',
          backgroundSize: '22px 22px', pointerEvents: 'none',
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AssignmentIcon sx={{ color: '#10B981', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{
                fontFamily: '"Syne",sans-serif', fontWeight: 800,
                fontSize: { xs: '1.4rem', sm: '1.75rem' }, color: '#EEF0FF', lineHeight: 1.15,
              }}>
                Test Plans
              </Typography>
              <Typography sx={{ color: 'rgba(238,240,255,0.45)', fontSize: '0.88rem', mt: 0.25 }}>
                Organise and track test execution by sprint
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              fontWeight: 700, borderRadius: '10px', px: 2.5,
              boxShadow: '0 4px 14px rgba(16,185,129,0.30)',
              '&:hover': { background: 'linear-gradient(135deg, #34D399, #10B981)' },
            }}
          >
            New Plan
          </Button>
        </Box>
      </Box>

      {/* Plans */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, color: 'rgba(238,240,255,0.30)' }}>
          <AssignmentIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'rgba(238,240,255,0.50)' }}>No test plans yet</Typography>
          <Typography>Click "New Plan" to create your first sprint test plan.</Typography>
        </Box>
      ) : (
        Object.entries(bySpint).map(([sprintLabel, sprintPlans]) => (
          <Box key={sprintLabel} sx={{ mb: 4 }}>
            <Typography sx={{
              fontFamily: '"Syne",sans-serif', fontWeight: 800,
              fontSize: '0.95rem', color: '#10B981',
              textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5,
            }}>
              {sprintLabel}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
              {sprintPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  features={features}
                  onOpen={() => setSelectedPlan(plan)}
                  onDelete={() => setDeleteTarget(plan)}
                />
              ))}
            </Box>
          </Box>
        ))
      )}

      {/* Create plan dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setPlanForm(PLAN_INIT) }}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#141720', borderRadius: 3, border: '1px solid rgba(238,240,255,0.10)' } }}
      >
        <DialogTitle sx={{ color: '#EEF0FF', fontWeight: 700 }}>New Test Plan</DialogTitle>
        <Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {createError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{createError}</Alert>
            )}
            <TextField label="Plan Name" value={planForm.name} onChange={setP('name')} required fullWidth />
            <TextField
              label="Sprint Number" type="number"
              value={planForm.sprintNumber} onChange={setP('sprintNumber')}
              required fullWidth inputProps={{ min: 1 }}
            />
            <TextField label="Description (optional)" value={planForm.description} onChange={setP('description')} multiline rows={2} fullWidth />
            {features.length > 0 && (
              <Box>
                <Typography sx={{ color: 'rgba(238,240,255,0.55)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                  Link Features (optional)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {features.map(f => {
                    const selected = planForm.featureIds.includes(f.id)
                    return (
                      <Chip
                        key={f.id}
                        label={`#${f.featureNumber} ${f.name}`}
                        onClick={() => toggleFeature(f.id)}
                        sx={{
                          bgcolor: selected ? 'rgba(16,185,129,0.15)' : 'rgba(238,240,255,0.05)',
                          color: selected ? '#10B981' : 'rgba(238,240,255,0.55)',
                          border: `1px solid ${selected ? 'rgba(16,185,129,0.35)' : 'rgba(238,240,255,0.10)'}`,
                          fontWeight: selected ? 700 : 400,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: selected ? 'rgba(16,185,129,0.20)' : 'rgba(238,240,255,0.08)' },
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
            <Button onClick={() => { setDialogOpen(false); setPlanForm(PLAN_INIT) }} sx={{ color: '#8891A8' }}>Cancel</Button>
            <Button
              onClick={handleCreatePlan}
              variant="contained"
              disabled={!planForm.name.trim() || !planForm.sprintNumber || creating}
              sx={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                fontWeight: 700, borderRadius: '8px',
                '&.Mui-disabled': { opacity: 0.5 },
              }}
            >
              {creating ? 'Creating…' : 'Create Plan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete plan confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { bgcolor: '#141720', borderRadius: 3, border: '1px solid rgba(238,240,255,0.10)' } }}>
        <DialogTitle sx={{ color: '#EEF0FF', fontWeight: 700 }}>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#8891A8' }}>
            "{deleteTarget?.name}" and all its test cases will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#8891A8' }}>Cancel</Button>
          <Button onClick={() => handleDeletePlan(deleteTarget)} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '8px' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ── Plan Card (needs test case count → fetches via onSnapshot) ────────────────

function PlanCard({ plan, features, onOpen, onDelete }) {
  const [tcCount, setTcCount] = useState(null)
  const [passCount, setPassCount] = useState(0)

  useEffect(() => {
    const unsub = subscribeToTestCases(plan.id, cases => {
      setTcCount(cases.length)
      setPassCount(cases.filter(c => c.status === 'Pass').length)
    })
    return unsub
  }, [plan.id])

  const pct = tcCount ? Math.round((passCount / tcCount) * 100) : 0
  const linkedFeatures = features.filter(f => plan.featureIds.includes(f.id))

  return (
    <Box sx={{
      bgcolor: '#141720', border: '1px solid rgba(238,240,255,0.08)',
      borderRadius: 2.5, p: 2.5, cursor: 'pointer', position: 'relative',
      transition: 'all 0.16s',
      '&:hover': { border: '1px solid rgba(16,185,129,0.25)', bgcolor: 'rgba(16,185,129,0.03)' },
    }}
      onClick={onOpen}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Chip
          label={`Sprint ${plan.sprintNumber}`}
          size="small"
          sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 700, fontSize: '0.72rem' }}
        />
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); onDelete() }}
          sx={{ color: 'rgba(248,113,113,0.35)', '&:hover': { color: '#F87171' }, mt: -0.5, mr: -0.5 }}
        >
          <DeleteIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <Typography sx={{ fontWeight: 700, color: '#EEF0FF', fontSize: '0.98rem', mb: 0.5, lineHeight: 1.3 }}>
        {plan.name}
      </Typography>

      {plan.description && (
        <Typography sx={{ fontSize: '0.80rem', color: 'rgba(238,240,255,0.40)', mb: 1.5, lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {plan.description}
        </Typography>
      )}

      {linkedFeatures.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {linkedFeatures.slice(0, 3).map(f => (
            <Chip key={f.id} label={`#${f.featureNumber}`} size="small"
              sx={{ bgcolor: 'rgba(129,140,248,0.10)', color: '#818CF8', fontSize: '0.68rem', height: 18 }} />
          ))}
          {linkedFeatures.length > 3 && (
            <Chip label={`+${linkedFeatures.length - 3}`} size="small"
              sx={{ bgcolor: 'rgba(238,240,255,0.06)', color: '#8891A8', fontSize: '0.68rem', height: 18 }} />
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(238,240,255,0.35)' }}>
          {tcCount === null ? '…' : `${tcCount} test case${tcCount !== 1 ? 's' : ''}`}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>{pct}% pass</Typography>
      </Box>

      <LinearProgress
        variant={tcCount === null ? 'indeterminate' : 'determinate'}
        value={pct}
        sx={{
          height: 4, borderRadius: 2,
          bgcolor: 'rgba(238,240,255,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 2 },
        }}
      />
    </Box>
  )
}
