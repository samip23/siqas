import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Button, Stack, Grid,
  Chip, Divider, CircularProgress, LinearProgress, Alert, Avatar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ListAltIcon from '@mui/icons-material/ListAlt'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SpeedIcon from '@mui/icons-material/Speed'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AssessmentIcon from '@mui/icons-material/Assessment'
import GroupIcon from '@mui/icons-material/Group'
import { format } from 'date-fns'
import { useFeatures } from '../../hooks/useFeatures'
import { computeMetrics } from '../../utils/metrics'
import { exportDashboardToPDF } from '../../utils/pdfExport'
import SprintBarChart from '../../components/Charts/SprintBarChart'
import PriorityPieChart from '../../components/Charts/PriorityPieChart'
import AssigneeBarChart from '../../components/Charts/AssigneeBarChart'
import CompletionTrendChart from '../../components/Charts/CompletionTrendChart'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import { EmptyDashboardIllustration, DotsPattern, SprintVelocityIcon } from '../../components/illustrations/Illustrations'

// ── Health config ─────────────────────────────────────────────────────────────
const HEALTH = {
  'On Track':        { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.30)',  dot: '#34D399' },
  'Needs Attention': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.30)',  dot: '#FBBF24' },
  'Behind Schedule': { color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.30)', dot: '#F87171' },
}

function getHealth(rate) {
  if (rate >= 75) return 'On Track'
  if (rate >= 50) return 'Needs Attention'
  return 'Behind Schedule'
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, icon: Icon, color, progress }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
      }} />
      <CardContent sx={{ p: 3, pt: 3.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.10em', fontSize: '0.68rem' }}>
            {title}
          </Typography>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px', bgcolor: `${color}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Stack>
        <Typography sx={{ fontSize: '2.6rem', fontWeight: 900, color, lineHeight: 1, mb: 0.75 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={1.5}>
            {subtitle}
          </Typography>
        )}
        {progress !== undefined && (
          <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{
            height: 5, borderRadius: 99, bgcolor: `${color}18`,
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 99 },
          }} />
        )}
      </CardContent>
    </Card>
  )
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function ChartCard({ id, title, subtitle, insight, children, action }) {
  return (
    <Card id={id} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box px={3} py={2.5} display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1} mr={2}>
            <Typography variant="h6" fontWeight={700} mb={0.25}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        <Divider />
        <Box p={2.5} pt={2}>{children}</Box>
        {insight && (
          <>
            <Divider />
            <Box px={3} py={1.5} sx={{ bgcolor: 'rgba(238,240,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              <AssessmentIcon sx={{ fontSize: 14, color: '#0EA5E9', mt: '1px', flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {insight}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, color = '#546E8A' }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
      {Icon && <Icon sx={{ fontSize: 15, color }} />}
      <Typography variant="overline" sx={{ color, letterSpacing: '0.12em', fontSize: '0.69rem', fontWeight: 800 }}>
        {label}
      </Typography>
      <Box flex={1} sx={{ height: '1px', bgcolor: 'divider' }} />
    </Stack>
  )
}

// ── Sprint Health Row ─────────────────────────────────────────────────────────
function SprintHealthRow({ sprint, total, completed }) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  const status = getHealth(rate)
  const sh = HEALTH[status]
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={{ xs: 1, sm: 2 }} sx={{
      py: 2, px: 3,
      '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
    }}>
      <Typography fontWeight={700} sx={{ minWidth: 90, fontSize: '0.875rem' }}>{sprint}</Typography>
      <Box flex={1}>
        <LinearProgress variant="determinate" value={rate} sx={{
          height: 8, borderRadius: 99, bgcolor: `${sh.color}16`,
          '& .MuiLinearProgress-bar': { bgcolor: sh.color, borderRadius: 99 },
        }} />
      </Box>
      <Typography fontWeight={800} sx={{ minWidth: 40, color: sh.color, fontSize: '0.9rem', textAlign: 'right' }}>
        {rate}%
      </Typography>
      <Box sx={{
        bgcolor: sh.bg, border: `1px solid ${sh.border}`, borderRadius: '6px',
        px: 1.5, py: 0.6, display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 148,
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: sh.dot, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: sh.color }}>{status}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100, textAlign: 'right' }}>
        {completed} / {total} features
      </Typography>
    </Stack>
  )
}

// ── Insight Callout ───────────────────────────────────────────────────────────
function InsightBox({ icon, text, bg, border }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, height: '100%' }}>
      <Box sx={{ mt: '1px', flexShrink: 0 }}>{icon}</Box>
      <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary', lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { features, loading, error } = useFeatures()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const metrics = computeMetrics(features)

  const handleExport = async () => {
    setExporting(true); setExportError(null)
    try { await exportDashboardToPDF(metrics, ['chart-sprint', 'chart-priority', 'chart-assignee', 'chart-trend']) }
    catch { setExportError('PDF export failed. Please try again.') }
    finally { setExporting(false) }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard…" />
  if (error) return <ErrorAlert title="Failed to load data" message={error} />

  if (!features.length) {
    return (
      <Box maxWidth={600} mx="auto" textAlign="center" py={8}>
        <EmptyDashboardIllustration width={300} />
        <Typography variant="h5" fontWeight={700} mt={3} mb={1}>No Features Loaded</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Upload a CSV file to populate the dashboard with analytics, charts, and metrics.
        </Typography>
        <Button variant="contained" size="large" startIcon={<UploadFileIcon />} onClick={() => navigate('/upload')}>
          Go to Feature Upload
        </Button>
      </Box>
    )
  }

  // ── Derived metrics ───────────────────────────────────────────────────────
  const overallHealth = getHealth(metrics.completionRate)
  const sh = HEALTH[overallHealth]

  const criticalFeatures = features.filter(f => {
    const p = (f.priority ?? '').toString().toLowerCase()
    return p === 'critical' || p === '1' || p === 'p1'
  })
  const criticalDone = criticalFeatures.filter(f => f.completedDate !== null).length
  const criticalRate = criticalFeatures.length > 0 ? Math.round((criticalDone / criticalFeatures.length) * 100) : null

  const avgVelocity = metrics.featuresPerSprint.length > 0
    ? Math.round(metrics.featuresPerSprint.reduce((s, sp) => s + sp.completed, 0) / metrics.featuresPerSprint.length)
    : 0

  const bestSprint = metrics.featuresPerSprint.length > 0
    ? metrics.featuresPerSprint.reduce((best, sp) => {
        const r = sp.total > 0 ? sp.completed / sp.total : 0
        const br = best.total > 0 ? best.completed / best.total : 0
        return r > br ? sp : best
      })
    : null

  const topPerformer = metrics.featuresPerAssignee.length > 0
    ? metrics.featuresPerAssignee.reduce((best, a) => {
        const r = a.total > 0 ? a.completed / a.total : 0
        const br = best.total > 0 ? best.completed / best.total : 0
        return r > br ? a : best
      })
    : null

  const sprintInsight = bestSprint
    ? `${bestSprint.sprint} achieved the highest completion rate (${bestSprint.total > 0 ? Math.round((bestSprint.completed / bestSprint.total) * 100) : 0}%). Average velocity: ${avgVelocity} features/sprint.`
    : null

  const critText = criticalFeatures.length > 0
    ? `${criticalDone} of ${criticalFeatures.length} Critical-priority features completed (${criticalRate}%).`
    : 'No Critical-priority features in this dataset.'

  const teamInsight = topPerformer && topPerformer.total > 0
    ? `Top performer: ${topPerformer.assignee} — ${Math.round((topPerformer.completed / topPerformer.total) * 100)}% completion rate across ${topPerformer.total} feature${topPerformer.total !== 1 ? 's' : ''}.`
    : null

  const remainingInActiveSprints = metrics.featuresPerSprint.filter(s => s.completed < s.total).length

  const KPI_CARDS = [
    {
      title: 'Total Features',
      value: metrics.total,
      icon: ListAltIcon,
      color: '#1A3A6B',
      subtitle: `Across ${metrics.featuresPerSprint.length} sprint${metrics.featuresPerSprint.length !== 1 ? 's' : ''}`,
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircleIcon,
      color: '#059669',
      subtitle: `${metrics.completionRate}% of all features done`,
      progress: metrics.completionRate,
    },
    {
      title: 'In Progress',
      value: metrics.inProgress,
      icon: HourglassEmptyIcon,
      color: '#0EA5E9',
      subtitle: `${100 - metrics.completionRate}% remaining`,
      progress: 100 - metrics.completionRate,
    },
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      icon: TrendingUpIcon,
      color: sh.color,
      subtitle: overallHealth,
      progress: metrics.completionRate,
    },
  ]

  // Assemble insight cards (filter nulls)
  const insights = [
    criticalFeatures.length > 0 && {
      icon: <WarningAmberIcon sx={{ fontSize: 17, color: criticalRate >= 75 ? '#10B981' : '#F87171' }} />,
      bg: criticalRate >= 75 ? 'rgba(16,185,129,0.10)' : 'rgba(248,113,113,0.10)',
      border: criticalRate >= 75 ? 'rgba(16,185,129,0.25)' : 'rgba(248,113,113,0.25)',
      text: critText,
    },
    sprintInsight && {
      icon: <SpeedIcon sx={{ fontSize: 17, color: '#818CF8' }} />,
      bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.25)',
      text: sprintInsight,
    },
    teamInsight && {
      icon: <EmojiEventsIcon sx={{ fontSize: 17, color: '#F59E0B' }} />,
      bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)',
      text: teamInsight,
    },
    metrics.inProgress > 0 && {
      icon: <HourglassEmptyIcon sx={{ fontSize: 17, color: '#38BDF8' }} />,
      bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.25)',
      text: `${metrics.inProgress} feature${metrics.inProgress !== 1 ? 's' : ''} still in progress across ${remainingInActiveSprints} active sprint${remainingInActiveSprints !== 1 ? 's' : ''}.`,
    },
  ].filter(Boolean)

  return (
    <Box maxWidth={1240} mx="auto" pb={5}>

      {/* ── Hero Banner ───────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative', overflow: 'hidden', borderRadius: 4, mb: 3.5,
        background: 'linear-gradient(135deg, #0A1C42 0%, #1A3A6B 55%, #1D5FA8 100%)',
        p: { xs: 3, sm: 4 },
      }}>
        <DotsPattern color="#FFFFFF" opacity={0.04} cols={20} rows={5} gap={24} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}
            justifyContent="space-between" gap={3}>
            <Box>
              {/* Report tag */}
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Box sx={{
                  bgcolor: 'rgba(14,165,233,0.20)', borderRadius: '6px',
                  px: 1.25, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.75,
                }}>
                  <DashboardIcon sx={{ color: '#7DD3FC', fontSize: 13 }} />
                  <Typography sx={{ color: '#7DD3FC', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                    QA Sprint Report
                  </Typography>
                </Box>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.22)' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.72rem' }}>
                  {format(new Date(), 'MMMM d, yyyy')}
                </Typography>
              </Stack>

              <Typography variant="h4" sx={{ color: 'white', mb: 0.5, fontWeight: 900, letterSpacing: '-0.5px' }}>
                Feature Progress Dashboard
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.875rem' }}>
                {metrics.total} features tracked · {metrics.featuresPerSprint.length} sprints · {metrics.featuresPerAssignee.length} team members
              </Typography>

              {/* Overall status pill */}
              <Box mt={2} display="inline-flex" alignItems="center" gap={1} sx={{
                bgcolor: `${sh.color}22`, border: `1px solid ${sh.color}44`,
                borderRadius: '8px', px: 1.75, py: 0.75,
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sh.dot, boxShadow: `0 0 6px ${sh.dot}` }} />
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>{overallHealth}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>
                  · {metrics.completionRate}% Complete
                </Typography>
              </Box>
            </Box>

            {/* Right: stats + gauge + export */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
                borderRadius: 2.5, px: 2.5, py: 1.75, textAlign: 'center', minWidth: 108,
              }}>
                <Typography sx={{ color: '#7DD3FC', fontWeight: 900, fontSize: '1.85rem', lineHeight: 1 }}>
                  {avgVelocity}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.60rem', letterSpacing: '0.08em', mt: 0.5, textTransform: 'uppercase' }}>
                  Avg velocity
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.30)', fontSize: '0.58rem', mt: 0.25 }}>
                  features / sprint
                </Typography>
              </Box>

              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
                borderRadius: 2.5, px: 2.5, py: 1.75, textAlign: 'center', minWidth: 108,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
              }}>
                <SprintVelocityIcon size={44} pct={metrics.completionRate} />
                <Typography sx={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.60rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Complete
                </Typography>
              </Box>

              <Button size="large"
                startIcon={exporting ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <PictureAsPdfIcon />}
                onClick={handleExport} disabled={exporting}
                sx={{
                  height: 50, bgcolor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                  color: 'white', backdropFilter: 'blur(12px)', flexShrink: 0, borderRadius: 2,
                  fontWeight: 700, fontSize: '0.875rem',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                  '&.Mui-disabled': { opacity: 0.5, color: 'white' },
                }}>
                {exporting ? 'Generating…' : 'Export PDF Report'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {exportError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      )}

      {/* ── KPI Row ───────────────────────────────────────────────────────────── */}
      <SectionHeader icon={AssessmentIcon} label="Performance Overview" />
      <Grid container spacing={2.5} mb={4}>
        {KPI_CARDS.map(kpi => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* ── Sprint Health Scorecard ───────────────────────────────────────────── */}
      {metrics.featuresPerSprint.length > 0 && (
        <Box mb={4}>
          <SectionHeader icon={SpeedIcon} label="Sprint Health Scorecard" />
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box px={3} py={1.75} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(238,240,255,0.04)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {metrics.featuresPerSprint.length} sprint{metrics.featuresPerSprint.length !== 1 ? 's' : ''} tracked
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {Object.entries(HEALTH).map(([label, { color }]) => (
                      <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Box>
              {metrics.featuresPerSprint.map(sp => (
                <SprintHealthRow key={sp.sprint} {...sp} />
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── Key Insights ──────────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <Box mb={4}>
          <SectionHeader icon={EmojiEventsIcon} label="Key Insights" color="#D97706" />
          <Grid container spacing={2}>
            {insights.map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <InsightBox {...item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Sprint Bar Chart ──────────────────────────────────────────────────── */}
      <SectionHeader icon={AssessmentIcon} label="Sprint Breakdown" />
      <Box mb={3.5}>
        <ChartCard id="chart-sprint"
          title="Features per Sprint"
          subtitle={`${metrics.featuresPerSprint.length} sprint${metrics.featuresPerSprint.length !== 1 ? 's' : ''} · total vs. completed`}
          insight={sprintInsight}
          action={
            <Chip label={`${metrics.featuresPerSprint.length} Sprints`} size="small"
              sx={{ bgcolor: 'rgba(129,140,248,0.14)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.30)', fontWeight: 700, fontSize: '0.72rem' }} />
          }>
          {metrics.featuresPerSprint.length === 0
            ? <Typography variant="body2" color="text.secondary" py={6} textAlign="center">No sprint data available.</Typography>
            : <SprintBarChart data={metrics.featuresPerSprint} />}
        </ChartCard>
      </Box>

      {/* ── Priority + Assignee ───────────────────────────────────────────────── */}
      <SectionHeader icon={GroupIcon} label="Feature Distribution" />
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} md={5}>
          <ChartCard id="chart-priority"
            title="Priority Distribution"
            subtitle={`${metrics.priorityDistribution.length} priority level${metrics.priorityDistribution.length !== 1 ? 's' : ''}`}
            insight={critText}>
            {metrics.priorityDistribution.length === 0
              ? <Typography variant="body2" color="text.secondary" py={6} textAlign="center">No priority data.</Typography>
              : <PriorityPieChart data={metrics.priorityDistribution} />}
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={7}>
          <ChartCard id="chart-assignee"
            title="Features per Assignee"
            subtitle={`${metrics.featuresPerAssignee.length} team member${metrics.featuresPerAssignee.length !== 1 ? 's' : ''}`}
            insight={teamInsight}>
            {metrics.featuresPerAssignee.length === 0
              ? <Typography variant="body2" color="text.secondary" py={6} textAlign="center">No assignee data.</Typography>
              : <AssigneeBarChart data={metrics.featuresPerAssignee} />}
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── Completion Trend ──────────────────────────────────────────────────── */}
      <SectionHeader icon={TrendingUpIcon} label="Completion Trend" />
      <Box mb={4}>
        <ChartCard id="chart-trend"
          title="Weekly Completion Trend"
          subtitle="Feature completions over time (grouped by week)">
          {metrics.completionTrend.length === 0
            ? (
              <Box py={6} textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>No completion dates recorded yet.</Typography>
                <Button variant="outlined" startIcon={<UploadFileIcon />} size="small" onClick={() => navigate('/upload')}>
                  Upload Features with Completion Dates
                </Button>
              </Box>
            )
            : <CompletionTrendChart data={metrics.completionTrend} />}
        </ChartCard>
      </Box>

      {/* ── Team Performance Table ────────────────────────────────────────────── */}
      {metrics.featuresPerAssignee.length > 0 && (
        <>
          <SectionHeader icon={GroupIcon} label="Team Performance" />
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box px={3} py={2.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Team Performance Summary</Typography>
                <Typography variant="caption" color="text.secondary">
                  Individual breakdown across all sprints · {metrics.featuresPerAssignee.length} team member{metrics.featuresPerAssignee.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{
                  width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem',
                  '& th': {
                    textAlign: 'left', py: 1.5, px: 2.5, bgcolor: '#1A1E2C', fontWeight: 800,
                    fontSize: '0.70rem', color: '#8891A8', borderBottom: '2px solid',
                    borderColor: 'rgba(238,240,255,0.08)', letterSpacing: '0.06em', textTransform: 'uppercase',
                  },
                  '& td': { py: 1.75, px: 2.5, borderBottom: '1px solid', borderColor: 'rgba(238,240,255,0.06)', verticalAlign: 'middle' },
                  '& tr:last-child td': { border: 0 },
                  '& tbody tr:hover td': { bgcolor: 'rgba(238,240,255,0.03)' },
                }}>
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Done</th>
                      <th style={{ textAlign: 'center' }}>Remaining</th>
                      <th style={{ width: 200 }}>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.featuresPerAssignee.map(row => {
                      const rate = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0
                      const status = getHealth(rate)
                      const rsh = HEALTH[status]
                      return (
                        <tr key={row.assignee}>
                          <td>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar sx={{
                                width: 34, height: 34, bgcolor: 'rgba(129,140,248,0.18)',
                                color: '#818CF8', fontSize: '0.72rem', fontWeight: 800,
                              }}>
                                {initials(row.assignee)}
                              </Avatar>
                              <Typography fontWeight={700} fontSize="0.875rem">{row.assignee}</Typography>
                            </Stack>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Chip label={row.total} size="small"
                              sx={{ bgcolor: 'rgba(129,140,248,0.14)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.30)', fontWeight: 800, minWidth: 36 }} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Chip label={row.completed} size="small"
                              sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.30)', fontWeight: 800, minWidth: 36 }} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Chip label={row.total - row.completed} size="small" sx={{
                              bgcolor: (row.total - row.completed) === 0 ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)',
                              color: (row.total - row.completed) === 0 ? '#10B981' : '#F59E0B',
                              border: `1px solid ${(row.total - row.completed) === 0 ? 'rgba(16,185,129,0.30)' : 'rgba(245,158,11,0.30)'}`,
                              fontWeight: 800, minWidth: 36,
                            }} />
                          </td>
                          <td>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <LinearProgress variant="determinate" value={rate} sx={{
                                flex: 1, height: 7, borderRadius: 99, bgcolor: `${rsh.color}16`,
                                '& .MuiLinearProgress-bar': { bgcolor: rsh.color, borderRadius: 99 },
                              }} />
                              <Typography fontWeight={800} fontSize="0.82rem" sx={{ color: rsh.color, minWidth: 36 }}>
                                {rate}%
                              </Typography>
                            </Stack>
                          </td>
                          <td>
                            <Box sx={{
                              bgcolor: rsh.bg, border: `1px solid ${rsh.border}`, borderRadius: '6px',
                              px: 1.25, py: 0.5, display: 'inline-flex', alignItems: 'center', gap: 0.75,
                            }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: rsh.dot, flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: rsh.color }}>{status}</Typography>
                            </Box>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
