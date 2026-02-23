import { useState, useEffect, useCallback } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getProfile, saveProfile as saveProfileDoc } from '../services/profileService'

export function useProfile(uid) {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState(null)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    getProfile(uid)
      .then(data => setProfile(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [uid])

  const saveProfile = useCallback(async (data) => {
    setSaving(true)
    setError(null)
    try {
      await saveProfileDoc(uid, data)
      if (data.displayName !== undefined) {
        await updateProfile(auth.currentUser, { displayName: data.displayName.trim() || null })
      }
      setProfile(prev => ({ ...prev, ...data }))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [uid])

  return { profile, loading, saving, error, saveProfile }
}
