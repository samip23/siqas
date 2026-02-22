import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
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

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
