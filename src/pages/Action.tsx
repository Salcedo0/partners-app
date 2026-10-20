import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '../firebase'
import { useI18n } from '../i18n'

/**
 * Landing page for Firebase email links (verify email, reset password).
 * Set this page as the action URL in Firebase Console → Authentication → Templates.
 */
export default function Action() {
  const { lang } = useI18n()
  const es = lang === 'es'
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const code = params.get('oobCode') || ''
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [newPass, setNewPass] = useState('')

  // Verify the email straight away.
  const runVerify = async () => {
    setState('working')
    try {
      await applyActionCode(auth, code)
      setState('done')
      setMsg(es ? '¡Correo confirmado! Vuelve a tu perfil y toca "Ya lo confirmé".' : 'Email confirmed! Go back to your profile and tap "I confirmed it".')
    } catch (e) {
      setState('error')
      setMsg((e as { code?: string }).code === 'auth/invalid-action-code'
        ? (es ? 'Este enlace ya se usó o caducó. Pide uno nuevo desde tu perfil.' : 'This link was already used or expired. Request a new one from your profile.')
        : (es ? 'No pudimos confirmar el correo.' : 'We couldn’t confirm the email.'))
    }
  }

  // Reset the password: first check the code, then ask for the new one.
  const [resetOk, setResetOk] = useState<string | null>(null)
  const checkReset = async () => {
    setState('working')
    try {
      setResetOk(await verifyPasswordResetCode(auth, code))
      setState('idle')
    } catch {
      setState('error')
      setMsg(es ? 'Este enlace ya se usó o caducó.' : 'This link was already used or expired.')
    }
  }
  const submitReset = async (e: FormEvent) => {
    e.preventDefault()
    setState('working')
    try {
      await confirmPasswordReset(auth, code, newPass)
      setState('done')
      setMsg(es ? 'Listo, ya puedes entrar con tu nueva contraseña.' : 'Done, you can sign in with your new password.')
    } catch (err) {
      setState('error')
      setMsg((err as { code?: string }).code === 'auth/weak-password'
        ? (es ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.')
        : (es ? 'No pudimos cambiar la contraseña.' : 'We couldn’t change the password.'))
    }
  }

  let body
  if (!code || (mode !== 'verifyEmail' && mode !== 'resetPassword')) {
    body = (
      <p className="error">
        {es
          ? 'Este enlace no tiene la información necesaria. Abre el enlace directamente desde el correo, sin copiarlo.'
          : 'This link is missing information. Open it straight from the email, without copying it.'}
      </p>
    )
  } else if (mode === 'verifyEmail') {
    body = state === 'done' || state === 'error' ? (
      <p className={state === 'error' ? 'error' : ''}>{msg}</p>
    ) : (
      <button className="btn grad block" onClick={runVerify} disabled={state === 'working'}>
        {es ? 'Confirmar mi correo' : 'Confirm my email'}
      </button>
    )
  } else if (state === 'done' || (state === 'error' && !resetOk)) {
    body = <p className={state === 'error' ? 'error' : ''}>{msg}</p>
  } else if (!resetOk) {
    body = (
      <button className="btn grad block" onClick={checkReset} disabled={state === 'working'}>
        {es ? 'Cambiar contraseña' : 'Change password'}
      </button>
    )
  } else {
    body = (
      <form className="stack" onSubmit={submitReset}>
        <input
          className="input"
          type="password"
          minLength={6}
          required
          placeholder={es ? 'Nueva contraseña' : 'New password'}
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <button className="btn grad block" disabled={state === 'working'}>{es ? 'Guardar' : 'Save'}</button>
        {state === 'error' && <div className="error">{msg}</div>}
      </form>
    )
  }

  return (
    <div className="narrow page stack" style={{ gap: 16, maxWidth: 480 }}>
      <span className="kicker">Partners Campus</span>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        {mode === 'resetPassword' ? (es ? 'Restablecer contraseña' : 'Reset password') : es ? 'Confirmar correo' : 'Confirm email'}
      </h1>
      {body}
      <Link to="/login" className="btn ghost" style={{ justifySelf: 'start' }}>{es ? 'Ir a entrar' : 'Go to sign in'}</Link>
    </div>
  )
}
