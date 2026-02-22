import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, onSnapshot, serverTimestamp, query, orderBy, deleteField,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'bulletin'

export function createPost(user, { content, category }) {
  return addDoc(collection(db, COL), {
    content,
    category,
    authorEmail: user.email,
    authorId: user.uid,
    createdAt: serverTimestamp(),
    editedAt: null,
    reactions: { '👍': {}, '❤️': {}, '🎉': {}, '😮': {} },
  })
}

export function updatePost(postId, content) {
  return updateDoc(doc(db, COL, postId), {
    content,
    editedAt: serverTimestamp(),
  })
}

export async function deletePost(postId) {
  const commentsSnap = await getDocs(collection(db, COL, postId, 'comments'))
  await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)))
  return deleteDoc(doc(db, COL, postId))
}

export function toggleReaction(postId, uid, emoji, hasReacted) {
  return updateDoc(doc(db, COL, postId), {
    [`reactions.${emoji}.${uid}`]: hasReacted ? deleteField() : true,
  })
}

export function addComment(postId, user, content) {
  return addDoc(collection(db, COL, postId, 'comments'), {
    content,
    authorEmail: user.email,
    authorId: user.uid,
    createdAt: serverTimestamp(),
  })
}

export function deleteComment(postId, commentId) {
  return deleteDoc(doc(db, COL, postId, 'comments', commentId))
}

export function subscribeToComments(postId, callback) {
  const q = query(collection(db, COL, postId, 'comments'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
