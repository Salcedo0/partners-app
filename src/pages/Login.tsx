import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { Icon } from '../ui'

const ERRORS: Record<string, { es: string; en: string }> = {
  'auth/invalid-credential': { es: 'Correo o contraseña incorrectos.', en: 'Wrong email or password.' },
  'auth/invalid-email': { es: 'Ese correo no es válido.', en: 'That email isn’t valid.' },
  'auth/email-already-in-use': { es: 'Ya existe una cuenta con ese correo. Entra en vez de registrarte.', en: 'An account with that email already exists. Sign in instead.' },
  'auth/weak-password': { es: 'La contraseña debe tener al menos 6 caracteres.', en: 'Password must be at least 6 characters.' },
  'auth/too-many-requests': { es: 'Demasiados intentos. Espera un momento.', en: 'Too many attempts. Wait a moment.' },
  'auth/operation-not-allowed': { es: 'Este método de inicio de sesión aún no está activado.', en: 'This sign-in method isn’t enabled yet.' },
  'auth/configuration-not-found': { es: 'Este método de inicio de sesión aún no está activado.', en: 'This sign-in method isn’t enabled yet.' },
}

export default function Login() {
  const { t, lang } = useI18n()
  const es = lang === 'es'
  const { user, loginMicrosoft, loginGoogle, loginEmail, signupEmail, resetPassword } = useAuth()
  const [err, setErr] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const from = (useLocation().state as { from?: string } | null)?.from || '/perfil'

  if (user) return <Navigate to={from} replace />

  const run = async (fn: () => Promise<void>) => {
    setErr(null)
    setInfo(null)
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      const code = (e as { code?: string }).code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      setErr(ERRORS[code]?.[lang] ?? `${t('login.error')} (${code || (e as Error).message})`)
    } finally {
      setBusy(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'signup') {
      if (!form.name.trim()) return setErr(es ? 'Escribe tu nombre.' : 'Enter your name.')
      return run(() => signupEmail(form.name, form.email, form.password))
    }
    return run(() => loginEmail(form.email, form.password))
  }

  const forgot = () => {
    if (!form.email.trim()) return setErr(es ? 'Escribe tu correo primero.' : 'Enter your email first.')
    return run(async () => {
      await resetPassword(form.email)
      setInfo(es ? 'Te enviamos un correo para cambiar la contraseña.' : 'We sent you an email to reset your password.')
    })
  }

  return (
    <div className="login">
      <div className="login-art">
        <img className="photo" src="/photos/jardin.jpg" alt="" />
        <img className="mark" src="/logo-white.png" alt="Partners Campus" />
      </div>
      <div className="login-form">
        <div className="login-box">
          <span className="kicker">Partners Campus EAFIT</span>
          <h1>{mode === 'signup' ? (es ? 'Crea tu cuenta' : 'Create your account') : t('login.title')}</h1>
          <p className="muted">
            {es ? 'Usa tu correo institucional @eafit.edu.co.' : 'Use your @eafit.edu.co email.'}
          </p>

          <form className="stack" onSubmit={submit}>
            {mode === 'signup' && (
              <input
                className="input"
                placeholder={es ? 'Nombre y apellido' : 'Full name'}
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              className="input"
              type="email"
              placeholder="nombre@eafit.edu.co"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder={es ? 'Contraseña' : 'Password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button className="btn grad block" disabled={busy}>
              {mode === 'signup' ? (es ? 'Crear cuenta' : 'Create account') : es ? 'Entrar' : 'Sign in'}
            </button>
          </form>

          <div className="spread" style={{ fontSize: 14 }}>
            <button
              className="btn ghost sm"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setErr(null)
                setInfo(null)
              }}
            >
              {mode === 'login' ? (es ? 'Crear cuenta nueva' : 'Create an account') : es ? 'Ya tengo cuenta' : 'I have an account'}
            </button>
            {mode === 'login' && (
              <button className="btn ghost sm" onClick={forgot} disabled={busy}>
                {es ? 'Olvidé mi contraseña' : 'Forgot password'}
              </button>
            )}
          </div>

          {err && <div className="error">{err}</div>}
          {info && <div className="card" style={{ padding: 12, fontSize: 14 }}>{info}</div>}

          <div className="row faint" style={{ fontSize: 12, gap: 10, margin: '6px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            {es ? 'o' : 'or'}
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
          <button className="provider" disabled={busy} onClick={() => run(loginMicrosoft)}>
            {Icon.microsoft} {t('login.microsoft')}
          </button>
          <button className="provider" disabled={busy} onClick={() => run(loginGoogle)}>
            {Icon.google} {t('login.google')}
          </button>
        </div>
      </div>
    </div>
  )
}
