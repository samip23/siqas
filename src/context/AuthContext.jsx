import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { getProfile } from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user)
      if (user) {
        const p = await getProfile(user.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // Called after profile is saved so all consumers update instantly
  const updateLocalProfile = useCallback(data => {
    setProfile(prev => ({ ...prev, ...data }))
  }, [])

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logOut() {
    return signOut(auth)
  }

  function updateDisplayName(name) {
    return updateProfile(auth.currentUser, { displayName: name || null })
  }

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, profile, updateLocalProfile, signUp, logIn, logOut, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
