import { useEffect, useMemo, useState } from 'react'
import { collection, collectionGroup, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'
import { COMMITTEES, ROADMAP, committeeName } from './content'
import { useAuth } from './auth'
import { useLive } from './hooks'
import { useI18n } from './i18n'

export type GhEvent = {
  id: string
  name: string
  committee: string
  /** YYYY-MM-DD, or '' for programs that run all year */
  date: string
  description: string
  points: number
  attendees?: string[]
}
export type Feedback = { id: string; text: string; byName: string; eventId?: string }
export type Honorary = { id: string; name: string; since: string; text: string; photo?: string; order?: number }

const today = () => new Date().toISOString().slice(0, 10)

export function useEvents(enabled = true) {
  return useLive<GhEvent>(enabled ? query(collection(db, 'events'), orderBy('date', 'asc')) : null, [enabled])
}

export const fmtDate = (d: string, lang: string) =>
  d
    ? new Date(d + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short' })
    : lang === 'es' ? 'Todo el año' : 'All year'

/* ---------- Committees accordion (home) ---------- */

export function CommitteesAccordion() {
  const { L, lang } = useI18n()
  const es = lang === 'es'
  const { user } = useAuth()
  const events = useEvents(!!user)

  return (
    <div className="acc">
      {COMMITTEES.map((c) => {
        const evs = (events || []).filter((e) => e.committee === c.id)
        return (
          <details key={c.id} className={'acc-item' + (c.id === 'gh' ? ' gh' : '')}>
            <summary>
              <div>
                <h4>{L(c.name)}</h4>
                <p>{L(c.desc)}</p>
              </div>
              {user && (
                <div className="acc-meta">
                  <small>{evs.length} {es ? 'eventos' : 'events'}</small>
                </div>
              )}
            </summary>
            <div className="acc-body">
              {!user ? (
                <p className="faint">{es ? 'Entra para ver los eventos, porcentajes y feedback.' : 'Sign in to see events, percentages and feedback.'}</p>
              ) : evs.length === 0 ? (
                <p className="faint">{es ? 'Este comité aún no tiene eventos registrados.' : 'No events registered for this committee yet.'}</p>
              ) : (
                evs.map((e) => <EventRow key={e.id} e={e} />)
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}

function EventRow({ e }: { e: GhEvent }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const fb = useLive<Feedback>(query(collection(db, 'events', e.id, 'feedback'), orderBy('at', 'desc')), [e.id])
  return (
    <details className="ev">
      <summary>
        <span className="ev-date">{fmtDate(e.date, lang)}</span>
        <b>{e.name}</b>
        <span className="ev-meta" />
      </summary>
      <div className="ev-body">
        {e.description && <p className="muted" style={{ fontSize: 14 }}>{e.description}</p>}
        <small className="faint">
          {e.attendees?.length || 0} {es ? 'asistentes' : 'attendees'}
        </small>
        <b style={{ fontSize: 13 }}>Feedback</b>
        {!fb?.length ? (
          <p className="faint" style={{ fontSize: 14 }}>{es ? 'Sin feedback todavía.' : 'No feedback yet.'}</p>
        ) : (
          <ul className="fb">
            {fb.map((f) => (
              <li key={f.id}>
                {f.text}
                <small className="faint"> — {f.byName}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

/* ---------- Feedback history ---------- */

export function FeedbackHistory() {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user } = useAuth()
  const events = useEvents(!!user)
  const [rows, setRows] = useState<(Feedback & { at?: { toMillis(): number } })[] | null>(null)
  const [committee, setCommittee] = useState('')

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      collectionGroup(db, 'feedback'),
      (s) => setRows(s.docs.map((d) => ({ id: d.id, eventId: d.ref.parent.parent?.id, ...(d.data() as Omit<Feedback, 'id'>) }))),
      () => setRows([]),
    )
  }, [user])

  const byId = useMemo(() => new Map((events || []).map((e) => [e.id, e])), [events])
  const list = (rows || [])
    .map((f) => ({ ...f, ev: byId.get(f.eventId || '') }))
    .filter((f) => f.ev && (!committee || f.ev.committee === committee))
    .sort((a, b) => (b.at?.toMillis() ?? 0) - (a.at?.toMillis() ?? 0))

  if (!user) return <p className="faint">{es ? 'Entra para consultar el histórico.' : 'Sign in to browse the history.'}</p>
  return (
    <div className="stack">
      <select className="input" style={{ maxWidth: 320 }} value={committee} onChange={(e) => setCommittee(e.target.value)}>
        <option value="">{es ? 'Todos los comités' : 'All committees'}</option>
        {COMMITTEES.map((c) => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
      </select>
      {list.length === 0 ? (
        <p className="faint">{es ? 'Todavía no hay feedback registrado.' : 'No feedback recorded yet.'}</p>
      ) : (
        <div className="fb-grid">
          {list.map((f) => (
            <article key={f.id} className="card stack" style={{ gap: 8 }}>
              <div className="spread">
                <b style={{ fontSize: 15 }}>{f.ev!.name}</b>
                <span className="chip">{committeeName(f.ev!.committee, lang)}</span>
              </div>
              <p style={{ fontSize: 14 }}>“{f.text}”</p>
              <small className="faint">{f.byName}{f.ev!.date ? ` · ${fmtDate(f.ev!.date, lang)}` : ''}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Honorarios ---------- */

/** Starburst with a person cut-out, used when an honorary has no photo. */
export function HonoraryMark({ size = 96 }: { size?: number }) {
  const spikes = 14
  const pts = Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 ? 30 : 48
    const a = (Math.PI * i) / spikes - Math.PI / 2
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="hono-mark">
      <polygon points={pts} fill="currentColor" />
      <circle cx="50" cy="40" r="9" fill="var(--card)" />
      <path d="M33 70c0-11 7.6-18 17-18s17 7 17 18z" fill="var(--card)" />
    </svg>
  )
}

export function Roadmap() {
  const { L } = useI18n()
  return (
    <ol className="roadmap">
      {ROADMAP.map((s, i) => (
        <li key={i}>
          <span className="rm-num">{i + 1}</span>
          <div>
            <b>{L(s.title)}</b>
            <p>{L(s.text)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Honoraries() {
  const { lang } = useI18n()
  const es = lang === 'es'
  const list = useLive<Honorary>(query(collection(db, 'honorarios')), [])
  const sorted = [...(list || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name))
  if (list && !list.length) return <p className="faint">{es ? 'Pronto conocerás a nuestros honorarios.' : 'Our honoraries will be listed soon.'}</p>
  return (
    <div className="hono-list">
      {sorted.map((h, i) => (
        <article key={h.id} className={'hono' + (i % 2 ? ' alt' : '')}>
          {h.photo ? <img className="hono-photo" src={h.photo} alt="" /> : <HonoraryMark />}
          <div>
            <h4>{h.name}</h4>
            {h.since && <span className="chip">{es ? 'Miembro desde' : 'Member since'} {h.since}</span>}
            <p>{h.text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

/* ---------- Calendar ---------- */

export function Calendar() {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user } = useAuth()
  const events = useEvents(!!user)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [onlyGh, setOnlyGh] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7 // Monday first
  const days = new Date(y, m + 1, 0).getDate()
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const list = (events || []).filter((e) => e.date && (!onlyGh || e.committee === 'gh'))
  const byDay = useMemo(() => {
    const map = new Map<string, GhEvent[]>()
    list.forEach((e) => map.set(e.date, [...(map.get(e.date) || []), e]))
    return map
  }, [list])
  const weekdays = es ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const pickedEvents = picked ? byDay.get(picked) || [] : []
  const t = today()

  return (
    <div className="cal card">
      <div className="spread" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <div className="row">
          <button className="btn ghost sm" onClick={() => setCursor(new Date(y, m - 1, 1))} aria-label="prev">←</button>
          <b style={{ minWidth: 150, textAlign: 'center', textTransform: 'capitalize' }}>
            {cursor.toLocaleDateString(es ? 'es-CO' : 'en-US', { month: 'long', year: 'numeric' })}
          </b>
          <button className="btn ghost sm" onClick={() => setCursor(new Date(y, m + 1, 1))} aria-label="next">→</button>
        </div>
        <label className="row" style={{ fontSize: 14, gap: 8 }}>
          <input type="checkbox" checked={onlyGh} onChange={(e) => setOnlyGh(e.target.checked)} />
          {es ? 'Solo eventos de GH' : 'GH events only'}
        </label>
      </div>
      {!user && <p className="faint" style={{ marginBottom: 10 }}>{es ? 'Entra para ver los eventos.' : 'Sign in to see events.'}</p>}
      <div className="cal-grid">
        {weekdays.map((wd, i) => <span key={i} className="cal-wd">{wd}</span>)}
        {Array.from({ length: first }, (_, i) => <span key={'b' + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1
          const evs = byDay.get(key(d)) || []
          return (
            <button
              key={d}
              className={'cal-day' + (key(d) === t ? ' today' : '') + (picked === key(d) ? ' on' : '')}
              onClick={() => setPicked(evs.length ? key(d) : null)}
            >
              {d}
              <span className="dots">
                {evs.slice(0, 3).map((e) => <i key={e.id} className={e.committee === 'gh' ? 'gh' : ''} />)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="row" style={{ gap: 14, fontSize: 12, marginTop: 10 }}>
        <span className="row" style={{ gap: 6 }}><i className="legend gh" /> GH</span>
        <span className="row" style={{ gap: 6 }}><i className="legend" /> {es ? 'Otros comités' : 'Other committees'}</span>
      </div>
      {pickedEvents.length > 0 && (
        <div className="stack" style={{ marginTop: 12 }}>
          {pickedEvents.map((e) => (
            <div key={e.id} className="spread" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <span><b>{e.name}</b> <small className="faint">· {committeeName(e.committee, lang)}</small></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
