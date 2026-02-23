import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useTestPlans() {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'testPlans'),
      orderBy('sprintNumber', 'asc'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      snap => {
        setPlans(snap.docs.map(d => {
          const data = d.data()
          return {
            id:           d.id,
            name:         data.name,
            sprintNumber: data.sprintNumber,
            description:  data.description,
            featureIds:   data.featureIds ?? [],
            createdAt:    data.createdAt?.toDate() ?? null,
            createdBy:    data.createdBy,
            authorId:     data.authorId,
          }
        }))
        setLoading(false)
        setError(null)
      },
      err => {
        console.error('testPlans snapshot error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { plans, loading, error }
}
