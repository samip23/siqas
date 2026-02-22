import { format, startOfWeek } from 'date-fns'

// Priority display normalization
const PRIORITY_NUMERIC_MAP = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Nice-to-Have',
}

const PRIORITY_ORDER = {
  critical: 0, high: 1, medium: 2, low: 3, 'nice-to-have': 4,
  p1: 0, p2: 1, p3: 2, p4: 3, p5: 4,
}

export function normalizePriority(raw) {
  if (raw === null || raw === undefined) return 'Unknown'
  const n = Number(raw)
  if (!isNaN(n) && PRIORITY_NUMERIC_MAP[n]) return PRIORITY_NUMERIC_MAP[n]
  const s = String(raw).trim()
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function prioritySortKey(priority) {
  return PRIORITY_ORDER[priority.toLowerCase()] ?? 99
}

/**
 * Derive all dashboard metrics from a flat array of feature records.
 */
export function computeMetrics(features) {
  if (!features || features.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      completionRate: 0,
      featuresPerSprint: [],
      featuresPerAssignee: [],
      priorityDistribution: [],
      completionTrend: [],
    }
  }

  const total = features.length
  const completed = features.filter(f => f.completedDate !== null).length
  const inProgress = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // --- Features per Sprint ---
  const sprintMap = {}
  features.forEach(f => {
    const key = `Sprint ${f.sprintNumber}`
    if (!sprintMap[key]) sprintMap[key] = { total: 0, completed: 0, sprintNumber: f.sprintNumber }
    sprintMap[key].total++
    if (f.completedDate) sprintMap[key].completed++
  })
  const featuresPerSprint = Object.entries(sprintMap)
    .map(([sprint, v]) => ({ sprint, total: v.total, completed: v.completed, sprintNumber: v.sprintNumber }))
    .sort((a, b) => a.sprintNumber - b.sprintNumber)

  // --- Features per Assignee ---
  const assigneeMap = {}
  features.forEach(f => {
    if (!assigneeMap[f.assignee]) assigneeMap[f.assignee] = { total: 0, completed: 0 }
    assigneeMap[f.assignee].total++
    if (f.completedDate) assigneeMap[f.assignee].completed++
  })
  const featuresPerAssignee = Object.entries(assigneeMap)
    .map(([assignee, v]) => ({ assignee, total: v.total, completed: v.completed }))
    .sort((a, b) => b.total - a.total)

  // --- Priority Distribution ---
  const priorityMap = {}
  features.forEach(f => {
    const key = normalizePriority(f.priority)
    if (!priorityMap[key]) priorityMap[key] = { total: 0, completed: 0 }
    priorityMap[key].total++
    if (f.completedDate) priorityMap[key].completed++
  })
  const priorityDistribution = Object.entries(priorityMap)
    .map(([priority, v]) => ({ priority, total: v.total, completed: v.completed }))
    .sort((a, b) => prioritySortKey(a.priority) - prioritySortKey(b.priority))

  // --- Completion Trend (by week, Mon–Sun) ---
  const trendMap = {}
  features
    .filter(f => f.completedDate)
    .forEach(f => {
      const weekStart = startOfWeek(f.completedDate, { weekStartsOn: 1 })
      const sortKey = weekStart.getTime()
      const label = format(weekStart, 'MMM d')
      if (!trendMap[sortKey]) trendMap[sortKey] = { label, count: 0 }
      trendMap[sortKey].count++
    })
  const completionTrend = Object.entries(trendMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, v]) => ({ week: v.label, count: v.count }))

  return {
    total,
    completed,
    inProgress,
    completionRate,
    featuresPerSprint,
    featuresPerAssignee,
    priorityDistribution,
    completionTrend,
  }
}

export const PRIORITY_COLORS = {
  Critical: '#D32F2F',
  High: '#E65100',
  Medium: '#1565C0',
  Low: '#2E7D32',
  'Nice-to-Have': '#7B1FA2',
  Unknown: '#757575',
}

export function getPriorityColor(priority) {
  return PRIORITY_COLORS[priority] ?? '#1565C0'
}
