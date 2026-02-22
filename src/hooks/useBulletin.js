import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useBulletin() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'bulletin'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      snap => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  return { posts, loading, error }
}
