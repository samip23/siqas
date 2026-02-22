import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { mockUploadFeatures, mockDeleteAll, mockGetFeatures } from './mockStore'

const MOCK = import.meta.env.VITE_MOCK_DB === 'true'
const COLLECTION = 'features'
const BATCH_LIMIT = 499 // Firestore max is 500 ops per batch

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Upload features, replacing any existing records.
 */
export async function uploadFeatures(features) {
  if (MOCK) { mockUploadFeatures(features); return }

  await deleteAllFeatures()
  const now = Timestamp.now()
  const colRef = collection(db, COLLECTION)
  const chunks = chunkArray(features, BATCH_LIMIT)

  for (const chunk of chunks) {
    const batch = writeBatch(db)
    for (const feature of chunk) {
      const ref = doc(colRef)
      batch.set(ref, {
        featureNumber: feature.featureNumber,
        name: feature.name,
        priority: feature.priority,
        assignee: feature.assignee,
        sprintNumber: feature.sprintNumber,
        completedDate: feature.completedDate
          ? Timestamp.fromDate(feature.completedDate)
          : null,
        createdAt: now,
      })
    }
    await batch.commit()
  }
}

/**
 * Delete all documents.
 */
export async function deleteAllFeatures() {
  if (MOCK) { mockDeleteAll(); return }

  const snapshot = await getDocs(collection(db, COLLECTION))
  if (snapshot.empty) return
  const chunks = chunkArray(snapshot.docs, BATCH_LIMIT)
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(d => batch.delete(d.ref))
    await batch.commit()
  }
}

/**
 * Fetch all features ordered by feature number.
 */
export async function getFeatures() {
  if (MOCK) return mockGetFeatures()

  const q = query(collection(db, COLLECTION), orderBy('featureNumber', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => normaliseDoc(d))
}

/**
 * Get a count without fetching documents.
 */
export async function getFeatureCount() {
  if (MOCK) return mockGetFeatures().length

  const snap = await getCountFromServer(collection(db, COLLECTION))
  return snap.data().count
}

function normaliseDoc(docSnap) {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    featureNumber: d.featureNumber,
    name: d.name,
    priority: d.priority,
    assignee: d.assignee,
    sprintNumber: d.sprintNumber,
    completedDate: d.completedDate ? d.completedDate.toDate() : null,
    createdAt: d.createdAt ? d.createdAt.toDate() : null,
  }
}
