import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: 'AIzaSyC5qBlPesB3bMn-LZNFZ-MEUv_Aq9TTVqE',
  authDomain: 'partners-campus-gh.firebaseapp.com',
  projectId: 'partners-campus-gh',
  storageBucket: 'partners-campus-gh.firebasestorage.app',
  messagingSenderId: '640852025461',
  appId: '1:640852025461:web:4035ec38728c728f0e583c',
})

export const auth = getAuth(app)
export const db = getFirestore(app)

// Local testing: `npm run dev:emu` points the app at the Firebase emulators.
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8085)
  // Emulator-only helper to sign in as fake test users without the OAuth popup.
  ;(window as unknown as Record<string, unknown>).devLogin = async (sub: string, email: string, name: string) => {
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
    const fake = JSON.stringify({ sub, email, email_verified: true, name })
    await signInWithCredential(auth, GoogleAuthProvider.credential(fake))
  }
}
