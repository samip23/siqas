/**
 * Generates realistic QA feature data for demo/testing purposes.
 */

const ASSIGNEES = [
  'Alice Chen', 'Bob Martinez', 'Carol Kim',
  'David Patel', 'Eva Rossi', 'Frank Liu',
]

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Nice-to-Have']
// Weighted probabilities for each priority (realistic distribution)
const PRIORITY_WEIGHTS = [0.08, 0.22, 0.38, 0.22, 0.10]

const FEATURE_NAMES = [
  // Auth
  'User Login with OAuth', 'Password Reset Flow', 'MFA / Two-Factor Auth',
  'Session Timeout Handling', 'Role-Based Access Control', 'User Profile Management',
  'Avatar Upload & Crop', 'Account Deletion Workflow', 'Email Verification',
  'SSO Integration (SAML)', 'Remember Me Token', 'Login Audit Logging',
  // Core
  'Dashboard Overview', 'Real-Time Notifications', 'Advanced Search & Filters',
  'Bulk Export to CSV', 'PDF Report Generation', 'Data Import from Excel',
  'Drag-and-Drop Reordering', 'Keyboard Shortcut Support', 'Dark Mode Toggle',
  'Responsive Mobile Layout', 'Infinite Scroll Pagination', 'Saved Filter Presets',
  // API & Data
  'REST API v2 Endpoints', 'GraphQL Schema Design', 'Cursor-Based Pagination',
  'Rate Limiting Middleware', 'Outbound Webhook System', 'Third-Party API Connector',
  'Audit Log Service', 'Data Encryption at Rest', 'Soft Delete Support',
  'Background Job Scheduler', 'API Versioning Strategy', 'OpenAPI Docs Generation',
  // QA
  'Unit Test Coverage ≥ 80%', 'E2E Suite — Checkout Flow', 'Performance Benchmarking',
  'Accessibility Audit (WCAG)', 'Cross-Browser Compatibility', 'Load Testing Scripts',
  'Regression Automation Suite', 'API Contract Testing', 'Security Penetration Test',
  'Error Monitoring Integration', 'Visual Regression Tests', 'Flaky Test Elimination',
  // Infra
  'CI/CD Pipeline Setup', 'Dockerise Services', 'Kubernetes Deployment',
  'Blue-Green Deployment', 'DB Migration Scripts', 'Log Aggregation (ELK)',
  'Alerting & On-Call Runbook', 'CDN Configuration', 'SSL Auto-Renewal',
  'Disaster Recovery Plan', 'Secret Manager Integration', 'Feature Flag Service',
  // UI/UX
  'Onboarding Wizard', 'Empty State Illustrations', 'Toast Notification System',
  'Contextual Help Tooltips', 'Form Validation Messages', 'Date Picker Component',
  'Data Grid Component', 'Chart Library Integration', 'Print-Friendly Styles',
  'i18n / Localisation Support', 'Skeleton Loading States', 'Command Palette (⌘K)',
]

function weightedRandom(items, weights) {
  let r = Math.random()
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randomBetween(a, b) {
  return new Date(a.getTime() + Math.random() * (b.getTime() - a.getTime()))
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const SPRINTS = [
  { sprint: 1, start: new Date('2025-01-06'), end: new Date('2025-01-31'), doneRate: 0.95 },
  { sprint: 2, start: new Date('2025-02-03'), end: new Date('2025-02-28'), doneRate: 0.88 },
  { sprint: 3, start: new Date('2025-03-03'), end: new Date('2025-03-28'), doneRate: 0.72 },
  { sprint: 4, start: new Date('2025-03-31'), end: new Date('2025-04-25'), doneRate: 0.40 },
]

export function generateDemoFeatures() {
  const shuffled = [...FEATURE_NAMES].sort(() => Math.random() - 0.5)
  const features = []
  let num = 1

  for (const s of SPRINTS) {
    const count = 14 + Math.floor(Math.random() * 4) // 14–17 per sprint

    for (let i = 0; i < count; i++) {
      const name = shuffled[num - 1] ?? `Feature ${num}`
      const done = Math.random() < s.doneRate
      features.push({
        featureNumber: num,
        name,
        priority: weightedRandom(PRIORITIES, PRIORITY_WEIGHTS),
        assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
        sprintNumber: s.sprint,
        completedDate: done ? randomBetween(s.start, addDays(s.end, 4)) : null,
      })
      num++
    }
  }

  return features
}
