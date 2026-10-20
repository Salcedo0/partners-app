import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type AuthProvider as FbProvider,
  type User,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Member } from './db'

/** Must match BOOTSTRAP_ADMINS in firestore.rules. */
export const BOOTSTRAP_ADMINS = ['partnerscampus@eafit.edu.co', 'jasalcedoy@eafit.edu.co', 'jandres.salcedoy@gmail.com']

type Ctx = {
  user: User | null
  member: Member | null
  isAdmin: boolean
  loading: boolean
  loginMicrosoft: () => Promise<void>
  loginGoogle: () => Promise<void>
  loginEmail: (email: string, password: string) => Promise<void>
  signupEmail: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  /** Re-reads the account so a just-verified email unlocks admin rights. */
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

// Name typed on the sign-up form, used when the member doc is created right after.
let pendingName = ''
const AuthCtx = createContext<Ctx>(null!)

/** Popup first; fall back to a full-page redirect where popups are blocked (some phones, in-app browsers). */
async function signIn(p: FbProvider) {
  try {
    await signInWithPopup(auth, p)
  } catch (e) {
    if ((e as { code?: string }).code === 'auth/popup-blocked') await signInWithRedirect(auth, p)
    else throw e
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [admins, setAdmins] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u)
    if (!u) {
      setMember(null)
      setLoading(false)
    }
  }), [])

  // Create the member doc on first sign-in, then keep it live.
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'members', user.uid)
    let unsub = () => {}
    let cancelled = false
    ;(async () => {
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          name: pendingName || user.displayName || user.email?.split('@')[0] || 'Partner',
          email: (user.email || '').toLowerCase(),
          photo: user.photoURL || '',
          committee: '',
          points: 0,
          bonus: 0,
          createdAt: serverTimestamp(),
        })
      }
      if (cancelled) return
      unsub = onSnapshot(ref, (s) => {
        setMember(s.exists() ? ({ id: s.id, ...s.data() } as Member) : null)
        setLoading(false)
      })
    })().catch((e) => {
      console.error(e)
      setLoading(false)
    })
    const unsubRoles = onSnapshot(
      doc(db, 'config', 'roles'),
      (s) => setAdmins(((s.data()?.admins as string[]) || []).map((e) => e.toLowerCase())),
      () => setAdmins([]),
    )
    return () => {
      cancelled = true
      unsub()
      unsubRoles()
    }
  }, [user])

  const email = (user?.email || '').toLowerCase()
  // Admin needs a verified email (see firestore.rules), so nobody can claim a GH address by just typing it.
  const isAdmin = !!user && user.emailVerified && (BOOTSTRAP_ADMINS.includes(email) || admins.includes(email))

  const value: Ctx = {
    user,
    member,
    isAdmin,
    loading,
    loginMicrosoft: async () => {
      const p = new OAuthProvider('microsoft.com')
      p.setCustomParameters({ prompt: 'select_account', domain_hint: 'eafit.edu.co' })
      await signIn(p)
    },
    loginGoogle: async () => {
      const p = new GoogleAuthProvider()
      p.setCustomParameters({ prompt: 'select_account' })
      await signIn(p)
    },
    loginEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    },
    signupEmail: async (name, email, password) => {
      pendingName = name.trim()
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await updateProfile(cred.user, { displayName: pendingName })
        await sendEmailVerification(cred.user).catch(console.error)
      } finally {
        window.setTimeout(() => (pendingName = ''), 5000)
      }
    },
    resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
    resendVerification: async () => {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser)
    },
    refreshUser: async () => {
      if (!auth.currentUser) return
      await auth.currentUser.reload()
      await auth.currentUser.getIdToken(true)
      setTick((n) => n + 1)
    },
    logout: () => signOut(auth),
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
