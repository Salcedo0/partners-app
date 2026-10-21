import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { BOOTSTRAP_ADMINS, useAuth } from '../auth'
import { committeeName } from '../content'
import { awardPoints, uidFromQr, type Activity, type Member, type Txn } from '../db'
import { db } from '../firebase'
import { useLive, useRanking } from '../hooks'
import { useI18n } from '../i18n'
import { Avatar, Gate, useToast } from '../ui'
import MemeAdmin from './MemeAdmin'
import AdminEvents from './AdminEvents'
import AdminHonorarios from './AdminHonorarios'
import { useEvents } from '../gh'

type Tab = 'scan' | 'events' | 'honorarios' | 'members' | 'activities' | 'memes' | 'admins'

export default function Admin() {
  return (
    <Gate admin>
      <AdminInner />
    </Gate>
  )
}

function AdminInner() {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<Tab>('scan')
  const members = useRanking(true)
  const activities = useLive<Activity>(query(collection(db, 'activities')), [])
  const toast = useToast()

  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="kicker">{lang === 'es' ? 'Gestión Humana' : 'Human Management'}</span>
        <h1>{t('nav.admin')}</h1>
      </div>
      <div className="tabs">
        {(['scan', 'events', 'honorarios', 'members', 'activities', 'memes', 'admins'] as Tab[]).map((k) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {t(`admin.${k}` as const)}
          </button>
        ))}
      </div>
      {tab === 'scan' && <Scan members={members || []} activities={activities || []} toast={toast.show} />}
      {tab === 'members' && <Members members={members} toast={toast.show} />}
      {tab === 'events' && <AdminEvents toast={toast.show} />}
      {tab === 'honorarios' && <AdminHonorarios toast={toast.show} />}
      {tab === 'activities' && <Activities activities={activities} />}
      {tab === 'memes' && <MemeAdmin toast={toast.show} />}
      {tab === 'admins' && <Admins toast={toast.show} />}
      {toast.node}
    </div>
  )
}

/* ---------------- Scan ---------------- */

function Scan({ members, activities, toast }: { members: Member[]; activities: Activity[]; toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user, member: me } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [camErr, setCamErr] = useState<string | null>(null)
  const [scannedUid, setScannedUid] = useState<string | null>(null)
  const [activityId, setActivityId] = useState<string>('')
  const [custom, setCustom] = useState({ points: 10, reason: '' })
  const [fast, setFast] = useState(false)
  const [busy, setBusy] = useState(false)
  const awarded = useRef(new Set<string>())

  const membersRef = useRef(members)
  membersRef.current = members
  const events = useEvents(true) || []
  const ev = activityId.startsWith('ev:') ? events.find((e) => 'ev:' + e.id === activityId) : undefined
  const activity = ev ? { id: ev.id, name: ev.name, points: ev.points } : activities.find((a) => a.id === activityId)
  const target = members.find((m) => m.id === scannedUid)

  const reason = activity ? activity.name : custom.reason.trim()
  const points = activity ? activity.points : custom.points

  const give = async (m: Member) => {
    if (!reason || !points) return
    const key = `${m.id}:${reason}`
    if (awarded.current.has(key)) {
      toast(es ? `${m.name} ya recibió puntos por “${reason}”` : `${m.name} already got points for “${reason}”`)
      return
    }
    setBusy(true)
    try {
      await awardPoints({ member: m, points, kind: 'activity', reason, byUid: user!.uid, byName: me?.name || 'GH' })
      // Record attendance on the event.
      if (ev) await updateDoc(doc(db, 'events', ev.id), { attendees: arrayUnion(m.id) })
      awarded.current.add(key)
      toast(`+${points} → ${m.name}`)
      setScannedUid(null)
    } catch (e) {
      console.error(e)
      toast(es ? 'No se pudo asignar' : 'Could not assign')
    } finally {
      setBusy(false)
    }
  }

  // Keep the latest give/fast for the scanner callback.
  const onScanRef = useRef<(uid: string) => void>(() => {})
  onScanRef.current = (uid: string) => {
    const m = membersRef.current.find((x) => x.id === uid)
    if (!m) {
      toast(es ? 'QR no reconocido' : 'Unknown QR')
      return
    }
    if (fast && reason && points) void give(m)
    else setScannedUid(uid)
  }

  useEffect(() => {
    if (!videoRef.current) return
    let last = ''
    let lastAt = 0
    const sc = new QrScanner(
      videoRef.current,
      (r) => {
        const uid = uidFromQr(r.data)
        const now = Date.now()
        if (!uid || (uid === last && now - lastAt < 3000)) return
        last = uid
        lastAt = now
        navigator.vibrate?.(60)
        onScanRef.current(uid)
      },
      { preferredCamera: 'environment', maxScansPerSecond: 6, returnDetailedScanResult: true },
    )
    scannerRef.current = sc
    sc.start().catch((e) => setCamErr(String(e?.message || e)))
    return () => {
      sc.stop()
      sc.destroy()
    }
  }, [])

  return (
    <div className="scan-layout">
      <div className="stack">
        <div className="scanner">
          <video ref={videoRef} muted playsInline />
          <div className="frame" />
        </div>
        {camErr && (
          <div className="error">
            {es ? 'No pudimos abrir la cámara: ' : 'Could not open the camera: '}
            {camErr}
          </div>
        )}
      </div>

      <div className="stack" style={{ gap: 16 }}>
        <div className="card stack">
          <b>{es ? '1. ¿Por qué actividad?' : '1. Which activity?'}</b>
          <select className="input" value={activityId} onChange={(e) => setActivityId(e.target.value)}>
            <option value="">{es ? 'Otra (escribir abajo)' : 'Other (type below)'}</option>
            {events.map((e) => (
              <option key={e.id} value={'ev:' + e.id}>📅 {e.name} · {e.points} pts</option>
            ))}
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.name} · {a.points} pts</option>
            ))}
          </select>
          {!activity && (
            <div className="row" style={{ alignItems: 'stretch' }}>
              <input
                className="input"
                placeholder={es ? 'Motivo (ej. Partners for Partners)' : 'Reason (e.g. Partners for Partners)'}
                value={custom.reason}
                onChange={(e) => setCustom({ ...custom, reason: e.target.value })}
              />
              <input
                className="input"
                type="number"
                style={{ width: 96 }}
                value={custom.points}
                onChange={(e) => setCustom({ ...custom, points: Number(e.target.value) })}
              />
            </div>
          )}
          <label className="row" style={{ fontSize: 14, gap: 8 }}>
            <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} />
            {es
              ? 'Modo rápido: asignar apenas se escanee (ideal para eventos)'
              : 'Fast mode: assign as soon as it scans (great for events)'}
          </label>
        </div>

        <div className="card scan-result">
          <b>{es ? '2. Escanea el QR del miembro' : '2. Scan the member’s QR'}</b>
          {target ? (
            <>
              <div className="big-member">
                <Avatar name={target.name} photo={target.photo} />
                <div>
                  <h3 style={{ fontSize: 20 }}>{target.name}</h3>
                  <div className="faint" style={{ fontSize: 13 }}>
                    {committeeName(target.committee, lang)} · {target.points} pts
                  </div>
                </div>
              </div>
              <div className="row">
                <button className="btn grad" disabled={busy || !reason || !points} onClick={() => give(target)}>
                  {es ? `Dar ${points || 0} pts` : `Give ${points || 0} pts`}
                </button>
                <button className="btn ghost" onClick={() => setScannedUid(null)}>{es ? 'Cancelar' : 'Cancel'}</button>
              </div>
              {!reason && <small className="faint">{es ? 'Escribe el motivo primero.' : 'Type a reason first.'}</small>}
            </>
          ) : (
            <p className="faint">
              {fast && reason
                ? es ? `Escaneando… cada QR suma ${points} pts por “${reason}”.` : `Scanning… each QR adds ${points} pts for “${reason}”.`
                : es ? 'Apunta la cámara al QR del perfil del miembro.' : 'Point the camera at the member’s profile QR.'}
            </p>
          )}
        </div>
        <RecentTxns />
      </div>
    </div>
  )
}

function RecentTxns() {
  const { lang } = useI18n()
  const rows = useLive<Txn>(query(collection(db, 'transactions'), orderBy('at', 'desc'), limit(8)), [])
  if (!rows?.length) return null
  return (
    <div className="card">
      <b>{lang === 'es' ? 'Últimos movimientos' : 'Latest activity'}</b>
      <div className="history">
        {rows.map((r) => (
          <div className="history-item" key={r.id} style={{ padding: '10px 0' }}>
            <div>
              <b style={{ fontSize: 14 }}>{r.memberName}</b>
              <div className="faint" style={{ fontSize: 12 }}>{r.reason} · {r.byName}</div>
            </div>
            <span className={'pts' + (r.kind === 'game' ? ' game' : '')} style={{ fontSize: 15 }}>
              {r.points > 0 ? '+' : ''}{r.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Members ---------------- */

function Members({ members, toast }: { members: Member[] | null; toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user, member: me } = useAuth()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [form, setForm] = useState({ points: 5, reason: '', kind: 'activity' as 'activity' | 'game' })

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (members || []).filter((m) => !s || m.name.toLowerCase().includes(s) || m.email.includes(s))
  }, [members, q])

  const submit = async (m: Member) => {
    if (!form.reason.trim() || !form.points) return
    await awardPoints({
      member: m,
      points: form.points,
      kind: form.kind,
      reason: form.reason.trim(),
      byUid: user!.uid,
      byName: me?.name || 'GH',
    })
    toast(`${form.points > 0 ? '+' : ''}${form.points} → ${m.name}`)
    setOpen(null)
  }

  if (!members) return <p className="faint">…</p>
  return (
    <div className="stack">
      <input className="input" placeholder={es ? 'Buscar por nombre o correo' : 'Search by name or email'} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card table-wrap" style={{ padding: 8 }}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>{es ? 'Miembro' : 'Member'}</th><th>{es ? 'Comité' : 'Committee'}</th><th>Pts</th><th>Bonus</th><th />
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <Fragment key={m.id}>
                <tr>
                  <td className="faint">{members.indexOf(m) + 1}</td>
                  <td>
                    <b>{m.name}</b>
                    <div className="faint" style={{ fontSize: 12 }}>{m.email}</div>
                  </td>
                  <td>{committeeName(m.committee, lang)}</td>
                  <td><b>{m.points}</b></td>
                  <td>{m.bonus}</td>
                  <td>
                    <button className="btn ghost sm" onClick={() => setOpen(open === m.id ? null : m.id)}>± pts</button>
                  </td>
                </tr>
                {open === m.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="row" style={{ flexWrap: 'wrap' }}>
                        <input className="input" type="number" style={{ width: 90 }} value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
                        <input className="input" style={{ flex: 1, minWidth: 180 }} placeholder={es ? 'Motivo' : 'Reason'} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                        <select className="input" style={{ width: 'auto' }} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as 'activity' | 'game' })}>
                          <option value="activity">{es ? 'Actividad' : 'Activity'}</option>
                          <option value="game">{es ? 'Bonus juego' : 'Game bonus'}</option>
                        </select>
                        <button className="btn grad sm" onClick={() => submit(m)}>{es ? 'Aplicar' : 'Apply'}</button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="faint" style={{ padding: 12 }}>{es ? 'Sin miembros aún.' : 'No members yet.'}</p>}
      </div>
    </div>
  )
}

/* ---------------- Activities ---------------- */

function Activities({ activities }: { activities: Activity[] | null }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const [name, setName] = useState('')
  const [points, setPoints] = useState(10)
  const add = async () => {
    if (!name.trim()) return
    await addDoc(collection(db, 'activities'), { name: name.trim(), points })
    setName('')
  }
  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <p className="muted">
        {es
          ? 'Crea las actividades del semestre con su puntaje para elegirlas rápido al escanear.'
          : 'Create this semester’s activities with their points to pick them quickly while scanning.'}
      </p>
      <div className="row">
        <input className="input" placeholder={es ? 'Ej. Día Partners' : 'e.g. Partners Day'} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="number" style={{ width: 96 }} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
        <button className="btn grad" onClick={add}>+</button>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {(activities || []).map((a) => (
          <div className="spread" key={a.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
            <span><b>{a.name}</b> <span className="faint">· {a.points} pts</span></span>
            <button className="btn ghost sm" onClick={() => deleteDoc(doc(db, 'activities', a.id))}>✕</button>
          </div>
        ))}
        {activities?.length === 0 && <p className="faint" style={{ padding: 12 }}>{es ? 'Aún no hay actividades.' : 'No activities yet.'}</p>}
      </div>
    </div>
  )
}

/* ---------------- Admins ---------------- */

function Admins({ toast }: { toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const ref = doc(db, 'config', 'roles')
  const [admins, setAdmins] = useState<string[]>([])
  useEffect(() => onSnapshot(ref, (s) => setAdmins((s.data()?.admins as string[]) || [])), [])  // eslint-disable-line react-hooks/exhaustive-deps
  const [email, setEmail] = useState('')

  const add = async () => {
    const e = email.trim().toLowerCase()
    if (!e.includes('@')) return
    await setDoc(ref, { admins: arrayUnion(e) }, { merge: true })
    setEmail('')
    toast(es ? 'Admin agregado' : 'Admin added')
  }

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <p className="muted">
        {es
          ? 'Solo estas personas de Gestión Humana pueden escanear y asignar puntos.'
          : 'Only these Human Management members can scan and assign points.'}
      </p>
      <div className="row">
        <input className="input" type="email" placeholder="nombre@eafit.edu.co" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn grad" onClick={add}>{es ? 'Agregar' : 'Add'}</button>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {BOOTSTRAP_ADMINS.map((a) => (
          <div className="spread" key={a} style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
            <span>{a}</span>
            <span className="chip">{es ? 'Fijo' : 'Built-in'}</span>
          </div>
        ))}
        {admins.map((a) => (
          <div className="spread" key={a} style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
            <span>{a}</span>
            <button className="btn ghost sm" onClick={() => setDoc(ref, { admins: arrayRemove(a) }, { merge: true })}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
