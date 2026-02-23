import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'users'

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTION, uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    displayName:  d.displayName  ?? '',
    jobTitle:     d.jobTitle     ?? '',
    department:   d.department   ?? '',
    bio:          d.bio          ?? '',
    avatarColor:  d.avatarColor  ?? '#F59E0B',
  }
}

export async function saveProfile(uid, { displayName, jobTitle, department, bio, avatarColor }) {
  await setDoc(doc(db, COLLECTION, uid), {
    displayName:  displayName.trim(),
    jobTitle:     jobTitle.trim(),
    department:   department.trim(),
    bio:          bio.trim(),
    avatarColor,
    updatedAt:    Timestamp.now(),
  }, { merge: true })
}
