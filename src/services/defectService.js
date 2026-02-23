import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'defects'

export async function addDefect(user, { title, severity, priority, assignedTo, dueDate, description }) {
  await addDoc(collection(db, COLLECTION), {
    title:      title.trim(),
    severity,
    priority,
    assignedTo: assignedTo.trim(),
    dueDate:    dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
    description: description.trim(),
    status:     'Open',
    createdAt:  Timestamp.now(),
    createdBy:  user.email,
    authorId:   user.uid,
  })
}

export async function updateDefectStatus(defectId, status) {
  await updateDoc(doc(db, COLLECTION, defectId), {
    status,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteDefect(defectId) {
  await deleteDoc(doc(db, COLLECTION, defectId))
}
