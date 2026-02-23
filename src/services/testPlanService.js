import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, writeBatch, onSnapshot, orderBy, query, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const PLANS = 'testPlans'

// ── Plans ─────────────────────────────────────────────────────────────────────

export async function createPlan(user, { name, sprintNumber, description, featureIds }) {
  return addDoc(collection(db, PLANS), {
    name:         name.trim(),
    sprintNumber: Number(sprintNumber),
    description:  description.trim(),
    featureIds:   featureIds ?? [],
    createdAt:    Timestamp.now(),
    createdBy:    user.email,
    authorId:     user.uid,
  })
}

export async function deletePlan(planId, testCases) {
  // Delete all subcollection docs first (Firestore doesn't cascade)
  if (testCases?.length) {
    const batch = writeBatch(db)
    testCases.forEach(tc =>
      batch.delete(doc(db, PLANS, planId, 'testCases', tc.id))
    )
    await batch.commit()
  }
  await deleteDoc(doc(db, PLANS, planId))
}

// ── Test Cases ────────────────────────────────────────────────────────────────

export async function addTestCase(planId, user, caseData) {
  await addDoc(collection(db, PLANS, planId, 'testCases'), {
    name:           caseData.name.trim(),
    description:    caseData.description?.trim() ?? '',
    requirementId:  caseData.requirementId ?? null,
    priority:       caseData.priority ?? 'Medium',
    type:           caseData.type ?? 'Functional',
    steps:          caseData.steps ?? [],
    expectedResult: caseData.expectedResult?.trim() ?? '',
    status:         'Not Run',
    source:         caseData.source ?? 'manual',
    addedBy:        user.email,
    addedAt:        Timestamp.now(),
  })
}

export async function addTestCasesBatch(planId, user, casesArray) {
  const batch = writeBatch(db)
  casesArray.forEach(tc => {
    const ref = doc(collection(db, PLANS, planId, 'testCases'))
    batch.set(ref, {
      name:           tc.name,
      description:    tc.description ?? '',
      requirementId:  tc.requirementId ?? null,
      priority:       tc.priority ?? 'Medium',
      type:           tc.type ?? 'Functional',
      steps:          tc.steps ?? [],
      expectedResult: tc.expectedResult ?? '',
      status:         'Not Run',
      source:         'generated',
      addedBy:        user.email,
      addedAt:        Timestamp.now(),
    })
  })
  await batch.commit()
}

export async function updateCaseStatus(planId, caseId, status) {
  await updateDoc(doc(db, PLANS, planId, 'testCases', caseId), { status })
}

export async function deleteTestCase(planId, caseId) {
  await deleteDoc(doc(db, PLANS, planId, 'testCases', caseId))
}

export function subscribeToTestCases(planId, callback) {
  const q = query(
    collection(db, PLANS, planId, 'testCases'),
    orderBy('addedAt', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
