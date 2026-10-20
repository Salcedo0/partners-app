import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { collection, doc, query, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '../auth'
import { COMMITTEES, committeeName } from '../content'
import { qrFor, type Txn } from '../db'
import { db } from '../firebase'
import { useLive, useRanking } from '../hooks'
import { useI18n } from '../i18n'
import { Gate, useToast } from '../ui'

export default function Profile() {
  return (
    <Gate>
      <ProfileInner />
    </Gate>
  )
}

function ProfileInner() {
  const { t, lang } = useI18n()
  const { user, member, logout, resendVerification, refreshUser } = useAuth()
  const ranking = useRanking(true)
  const txns = useLive<Txn>(query(collection(db, 'transactions'), where('uid', '==', user!.uid)), [user!.uid])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [committee, setCommittee] = useState('')
  const toast = useToast()

  const position = useMemo(() => {
    const i = ranking?.findIndex((m) => m.id === user!.uid) ?? -1
    return i >= 0 ? i + 1 : null
  }, [ranking, user])
  const history = useMemo(
    () => [...(txns || [])].sort((a, b) => (b.at?.toMillis() ?? Date.now()) - (a.at?.toMillis() ?? Date.now())),
    [txns],
  )

  if (!member) return <div className="center faint">{t('common.loading')}</div>

  const startEdit = () => {
    setName(member.name)
    setCommittee(member.committee)
    setEditing(true)
  }
  const save = async () => {
    await updateDoc(doc(db, 'members', member.id), { name: name.trim() || member.name, committee })
    setEditing(false)
    toast.show(t('profile.saved'))
  }

  const es = lang === 'es'
  return (
    <div className="wrap page stack" style={{ gap: 20 }}>
      {!user!.emailVerified && (
        <section className="card spread" style={{ flexWrap: 'wrap', background: '#fff6ec' }}>
          <div style={{ fontSize: 14 }}>
            <b>{es ? 'Confirma tu correo' : 'Confirm your email'}</b>
            <div className="muted">
              {es
                ? `Te enviamos un enlace a ${user!.email}. Solo hace falta si eres de GH (para poder asignar puntos).`
                : `We sent a link to ${user!.email}. Only needed if you’re in GH (to assign points).`}
            </div>
          </div>
          <div className="row">
            <button className="btn ghost sm" onClick={() => resendVerification().then(() => toast.show(es ? 'Correo reenviado' : 'Email sent'))}>
              {es ? 'Reenviar' : 'Resend'}
            </button>
            <button className="btn sm" onClick={refreshUser}>{es ? 'Ya lo confirmé' : 'I confirmed it'}</button>
          </div>
        </section>
      )}
      <section className="profile-top">
        <div className="stack" style={{ gap: 18, position: 'relative', zIndex: 1 }}>
          <div>
            <span className="kicker" style={{ color: '#ffe0d7' }}>
              {t('profile.committee')}: {committeeName(member.committee, lang)}
            </span>
            <h1 style={{ marginTop: 6 }}>{member.name}</h1>
          </div>
          <div className="stats">
            <div className="stat"><b>{member.points}</b><span>{t('profile.points')}</span></div>
            <div className="stat"><b>+{member.bonus}</b><span>{t('profile.bonus')}</span></div>
            <div className="stat"><b>{position ? `#${position}` : '—'}</b><span>{t('profile.position')}</span></div>
          </div>
          <div>
            <button className="btn white sm" onClick={startEdit}>
              {lang === 'es' ? 'Editar perfil' : 'Edit profile'}
            </button>
          </div>
        </div>
        <div className="qr-card">
          <QRCodeSVG value={qrFor(member.id)} size={172} fgColor="#161a2b" level="M" marginSize={1} />
          <small>{t('profile.qr')}</small>
        </div>
      </section>
      <p className="faint" style={{ fontSize: 14, textAlign: 'center' }}>{t('profile.qrHint')}</p>

      {editing && (
        <section className="card stack">
          <label className="field">
            {t('profile.name')}
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label className="field">
            {t('profile.committee')}
            <select className="select input" value={committee} onChange={(e) => setCommittee(e.target.value)}>
              <option value="">—</option>
              {COMMITTEES.map((c) => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
            </select>
          </label>
          <div className="row">
            <button className="btn grad" onClick={save}>{t('profile.save')}</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>{t('common.cancel')}</button>
          </div>
        </section>
      )}

      <section className="card">
        <h3 style={{ fontSize: 20, marginBottom: 6 }}>{t('profile.history')}</h3>
        {txns === null ? (
          <p className="faint">{t('common.loading')}</p>
        ) : history.length === 0 ? (
          <p className="faint" style={{ padding: '12px 0' }}>{t('profile.empty')}</p>
        ) : (
          <div className="history">
            {history.map((h) => (
              <div className="history-item" key={h.id}>
                <span className="dot">{h.kind === 'game' ? '🎲' : '⭐'}</span>
                <div>
                  <b style={{ fontSize: 15 }}>{h.reason}</b>
                  <div className="faint" style={{ fontSize: 12 }}>
                    {h.at?.toDate().toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' })}
                    {' · '}
                    {h.kind === 'game' ? t('profile.bonus') : 'GH'} · {h.byName}
                  </div>
                </div>
                <span className={'pts' + (h.kind === 'game' ? ' game' : '')}>
                  {h.points > 0 ? '+' : ''}{h.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      <button className="btn ghost" style={{ justifySelf: 'center' }} onClick={logout}>{t('nav.logout')}</button>
      {toast.node}
    </div>
  )
}
