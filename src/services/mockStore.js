/**
 * localStorage-backed mock store.
 * Mimics the Firestore API used by featureService + useFeatures.
 * Used when VITE_MOCK_DB=true (no Firebase / Java emulator needed).
 */

const LS_KEY = 'siqas_features'
const EVENT_NAME = 'siqas:features-changed'

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function readRaw() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRaw(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

/** Read all features, deserialising date strings back to Date objects. */
export function mockGetFeatures() {
  return readRaw().map(f => ({
    ...f,
    completedDate: f.completedDate ? new Date(f.completedDate) : null,
    createdAt: f.createdAt ? new Date(f.createdAt) : null,
  }))
}

/** Replace all features. Accepts same shape as featureService.uploadFeatures. */
export function mockUploadFeatures(features) {
  const now = new Date().toISOString()
  const data = features.map((f, i) => ({
    id: `mock-${Date.now()}-${i}`,
    featureNumber: f.featureNumber,
    name: f.name,
    priority: f.priority,
    assignee: f.assignee,
    sprintNumber: f.sprintNumber,
    completedDate: f.completedDate ? f.completedDate.toISOString() : null,
    createdAt: now,
  }))
  writeRaw(data)
  notify()
}

/** Delete all features from localStorage. */
export function mockDeleteAll() {
  localStorage.removeItem(LS_KEY)
  notify()
}

/** Subscribe to data changes (mirrors onSnapshot pattern). Returns unsubscribe fn. */
export function mockSubscribe(callback) {
  // Fire immediately with current data
  callback(mockGetFeatures())

  const handler = () => callback(mockGetFeatures())
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}

export const MOCK_EVENT = EVENT_NAME
