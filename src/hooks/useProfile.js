import { useState, useCallback } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import { saveProfile as saveProfileDoc } from '../services/profileService'

export function useProfile(uid) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const saveProfile = useCallback(async (data) => {
    setSaving(true)
    setError(null)
    try {
      await saveProfileDoc(uid, data)
      if (data.displayName !== undefined) {
        await updateProfile(auth.currentUser, { displayName: data.displayName.trim() || null })
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [uid])

  return { saving, error, saveProfile }
}
