import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useDefects() {
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'defects'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => {
          const d = doc.data()
          return {
            id:          doc.id,
            title:       d.title,
            severity:    d.severity,
            priority:    d.priority,
            assignedTo:  d.assignedTo,
            dueDate:     d.dueDate     ? d.dueDate.toDate()     : null,
            description: d.description,
            status:      d.status,
            createdAt:   d.createdAt   ? d.createdAt.toDate()   : null,
            createdBy:   d.createdBy,
            authorId:    d.authorId,
          }
        })
        setDefects(data)
        setLoading(false)
        setError(null)
      },
      err => {
        console.error('Defects snapshot error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { defects, loading, error }
}
