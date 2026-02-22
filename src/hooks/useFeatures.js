import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { mockSubscribe } from '../services/mockStore'

const MOCK = import.meta.env.VITE_MOCK_DB === 'true'

/**
 * Real-time subscription for the features collection.
 * Uses localStorage mock when VITE_MOCK_DB=true, Firestore otherwise.
 */
export function useFeatures() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (MOCK) {
      const unsubscribe = mockSubscribe(data => {
        const sorted = [...data].sort((a, b) => a.featureNumber - b.featureNumber)
        setFeatures(sorted)
        setLoading(false)
      })
      return unsubscribe
    }

    // Real Firestore path
    const q = query(
      collection(db, 'features'),
      orderBy('featureNumber', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => {
          const d = doc.data()
          return {
            id: doc.id,
            featureNumber: d.featureNumber,
            name: d.name,
            priority: d.priority,
            assignee: d.assignee,
            sprintNumber: d.sprintNumber,
            completedDate: d.completedDate ? d.completedDate.toDate() : null,
            createdAt: d.createdAt ? d.createdAt.toDate() : null,
          }
        })
        setFeatures(data)
        setLoading(false)
        setError(null)
      },
      err => {
        console.error('Firestore snapshot error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { features, loading, error }
}
