/**
 * Seed script — populates the local Firestore emulator with realistic QA demo data.
 * Run: node scripts/seed.mjs
 * Requires: firebase emulator running on port 8080
 */
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  writeBatch,
  getDocs,
  doc,
  Timestamp,
} from 'firebase/firestore'

// ─── Firebase init (demo project, emulator only) ─────────────────────────────
const app = initializeApp({ projectId: 'demo-siqas' })
const db = getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)

// ─── Demo data ────────────────────────────────────────────────────────────────
const ASSIGNEES = [
  'Alice Chen', 'Bob Martinez', 'Carol Kim',
  'David Patel', 'Eva Rossi', 'Frank Liu',
]

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Nice-to-Have']
const PRIORITY_WEIGHTS = [0.08, 0.22, 0.38, 0.22, 0.10]  // realistic distribution

const FEATURE_NAMES = [
  // Auth & Users
  'User Login with OAuth',       'Password Reset Flow',          'MFA / Two-Factor Auth',
  'Session Timeout Handling',    'Role-Based Access Control',    'User Profile Management',
  'Avatar Upload',               'Account Deletion Workflow',    'Email Verification',
  'SSO Integration',
  // Core Features
  'Dashboard Overview',          'Real-Time Notifications',      'Advanced Search & Filters',
  'Bulk Export to CSV',          'PDF Report Generation',        'Data Import from Excel',
  'Drag-and-Drop Reordering',    'Keyboard Shortcut Support',    'Dark Mode Toggle',
  'Responsive Mobile Layout',
  // Data & API
  'REST API v2 Endpoints',       'GraphQL Schema Design',        'Pagination & Cursor Logic',
  'Rate Limiting Middleware',    'Webhook Integration',          'Third-Party API Connector',
  'Audit Log Service',           'Data Encryption at Rest',      'Soft Delete Support',
  'Background Job Scheduler',
  // QA & Testing
  'Unit Test Coverage ≥ 80%',    'E2E Test Suite — Checkout',    'Performance Benchmark',
  'Accessibility Audit (WCAG)',  'Cross-Browser Compatibility',  'Load Testing Scripts',
  'Regression Test Automation',  'API Contract Testing',         'Security Penetration Test',
  'Error Monitoring Integration',
  // Infra & DevOps
  'CI/CD Pipeline Setup',        'Dockerise Services',           'Kubernetes Deployment',
  'Blue-Green Deployment',       'Database Migration Scripts',   'Log Aggregation (ELK)',
  'Alerting & On-Call Config',   'CDN Configuration',            'SSL Certificate Renewal',
  'Disaster Recovery Plan',
  // UI/UX
  'Onboarding Wizard',           'Empty State Illustrations',    'Toast Notification System',
  'Contextual Help Tooltips',    'Form Validation Messages',     'Date Picker Component',
  'Data Grid Component',         'Chart Library Integration',    'Print-Friendly Styles',
  'Localisation (i18n) Support',
]

function weightedRandom(items, weights) {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return items[i]
  }
  return items[items.length - 1]
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// ─── Generate features ────────────────────────────────────────────────────────
// 4 sprints, ~15 features each = 60 features total
const SPRINT_CONFIG = [
  { sprint: 1, start: new Date('2025-01-06'), end: new Date('2025-01-31'), completionRate: 0.95 },
  { sprint: 2, start: new Date('2025-02-03'), end: new Date('2025-02-28'), completionRate: 0.85 },
  { sprint: 3, start: new Date('2025-03-03'), end: new Date('2025-03-28'), completionRate: 0.70 },
  { sprint: 4, start: new Date('2025-03-31'), end: new Date('2025-04-25'), completionRate: 0.35 },
]

const shuffled = [...FEATURE_NAMES].sort(() => Math.random() - 0.5)
const features = []
let featureNumber = 1

for (const sprint of SPRINT_CONFIG) {
  const count = 14 + Math.floor(Math.random() * 4)  // 14–17 per sprint
  for (let i = 0; i < count && featureNumber <= shuffled.length; i++) {
    const isCompleted = Math.random() < sprint.completionRate
    const completedDate = isCompleted
      ? randomDate(sprint.start, addDays(sprint.end, 3))
      : null

    features.push({
      featureNumber,
      name: shuffled[featureNumber - 1] ?? `Feature ${featureNumber}`,
      priority: weightedRandom(PRIORITIES, PRIORITY_WEIGHTS),
      assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
      sprintNumber: sprint.sprint,
      completedDate: completedDate ? Timestamp.fromDate(completedDate) : null,
      createdAt: Timestamp.fromDate(sprint.start),
    })
    featureNumber++
  }
}

// ─── Delete existing + batch-write new ───────────────────────────────────────
const BATCH_SIZE = 499

async function deleteAll() {
  const snap = await getDocs(collection(db, 'features'))
  if (snap.empty) return
  const chunks = []
  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) chunks.push(snap.docs.slice(i, i + BATCH_SIZE))
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(d => batch.delete(d.ref))
    await batch.commit()
  }
  console.log(`  Deleted ${snap.docs.length} existing documents.`)
}

async function seed() {
  console.log('\n🌱  SIQAS Demo Seed Script')
  console.log('─'.repeat(40))
  console.log(`  Connecting to emulator at 127.0.0.1:8080`)
  console.log(`  Project: demo-siqas`)
  console.log(`  Generating ${features.length} features across ${SPRINT_CONFIG.length} sprints…\n`)

  await deleteAll()

  const colRef = collection(db, 'features')
  const chunks = []
  for (let i = 0; i < features.length; i += BATCH_SIZE) chunks.push(features.slice(i, i + BATCH_SIZE))

  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(f => batch.set(doc(colRef), f))
    await batch.commit()
  }

  const completed = features.filter(f => f.completedDate).length
  const rate = Math.round((completed / features.length) * 100)

  console.log(`✅  Seeded ${features.length} features`)
  console.log(`   • Completed : ${completed} (${rate}%)`)
  console.log(`   • In Progress: ${features.length - completed} (${100 - rate}%)`)
  console.log(`   • Assignees : ${ASSIGNEES.join(', ')}`)
  console.log(`   • Sprints   : ${SPRINT_CONFIG.map(s => s.sprint).join(', ')}`)
  console.log('\n🚀  Open http://localhost:5174 to see the data.\n')
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message)
  console.error('    Make sure the Firestore emulator is running: firebase emulators:start --only firestore')
  process.exit(1)
})
