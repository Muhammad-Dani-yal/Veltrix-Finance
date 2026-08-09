import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { get, onDisconnect, onValue, ref, serverTimestamp, set, update } from 'firebase/database'
import { auth, database } from '../services/firebase'

/* oxlint-disable react/only-export-components */
const AuthContext = createContext(null)
export const MANAGER_EMAIL = 'muhammaddaniyal5477@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stopProfile = () => {}
    const stopAuth = onAuthStateChanged(auth, async (currentUser) => {
      stopProfile()
      if (!currentUser) { setUser(null); setProfile(null); setLoading(false); return }
      setUser(currentUser); setLoading(true)
      const profileRef = ref(database, `users/${currentUser.uid}`)
      stopProfile = onValue(profileRef, snapshot => {
        let data = snapshot.val()
        if (currentUser.email?.toLowerCase() === MANAGER_EMAIL) {
          data = { ...data, name: data?.name || currentUser.displayName || 'Muhammad Daniyal', email: currentUser.email, role: 'manager', status: 'approved' }
        }
        setProfile(data)
        setLoading(false)
      }, () => {
        const manager = currentUser.email?.toLowerCase() === MANAGER_EMAIL
        setProfile(manager ? { name: currentUser.displayName || 'Muhammad Daniyal', email: currentUser.email, role: 'manager', status: 'approved' } : null)
        setLoading(false)
      })
      try {
        const presenceRef = ref(database, `users/${currentUser.uid}/presence`)
        await onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() })
        await set(presenceRef, { online: true, lastSeen: serverTimestamp() })
      } catch { /* Presence is optional when database rules restrict writes. */ }
    })
    return () => { stopProfile(); stopAuth() }
  }, [])

  const login = async (email, password, requestedPortal) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const isManager = email.toLowerCase() === MANAGER_EMAIL
    if (isManager) {
      if (requestedPortal !== 'staff' && requestedPortal !== 'employee') { await signOut(auth); throw { code: 'auth/wrong-portal' } }
      return result
    }
    let data
    try { data = (await get(ref(database, `users/${result.user.uid}`))).val() }
    catch { data = null }
    if (!data) { await signOut(auth); throw { code: 'auth/profile-unavailable' } }
    const isStaff = data?.role === 'employee' || data?.role === 'manager'
    const wantsStaff = requestedPortal === 'staff' || requestedPortal === 'employee'
    if ((wantsStaff && !isStaff) || (requestedPortal === 'customer' && data?.role !== 'customer')) { await signOut(auth); throw { code: 'auth/wrong-portal' } }
    if (data.role === 'employee' && !['active','approved'].includes(data.status)) { await signOut(auth); throw { code: ['rejected','inactive'].includes(data.status) ? 'auth/employee-rejected' : 'auth/employee-pending' } }
    if (data.role === 'customer' && !['active','approved'].includes(data.status)) { await signOut(auth); throw { code: 'auth/customer-inactive' } }
    return result
  }
  const logout = () => signOut(auth)
  const updateDisplayName = async (name) => {
    const cleanName = name.trim()
    if (!auth.currentUser || cleanName.length < 2) throw new Error('Please enter a valid display name.')
    await updateProfile(auth.currentUser, { displayName: cleanName })
    await update(ref(database, `users/${auth.currentUser.uid}`), { name: cleanName, updatedAt: Date.now() })
    setProfile(current => ({ ...current, name: cleanName }))
  }
  const value = useMemo(() => ({ user, profile, loading, login, logout, updateDisplayName }), [user, profile, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
