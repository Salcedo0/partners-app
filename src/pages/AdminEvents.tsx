import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../auth'
import { COMMITTEES, committeeName } from '../content'
import { db } from '../firebase'
import { fmtDate, useEvents, type GhEvent } from '../gh'
import { useI18n } from '../i18n'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function AdminEvents({ toast }: { toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const events = useEvents(true)
  const [form, setForm] = useState({ name: '', committee: 'gh', date: todayStr(), allYear: false, points: 10, description: '' })

  const add = async () => {
    if (!form.name.trim()) return
    await addDoc(collection(db, 'events'), {
      name: form.name.trim(),
      committee: form.committee,
      date: form.allYear ? '' : form.date,
      points: form.points,
      description: form.description.trim(),
      attendees: [],
      createdAt: serverTimestamp(),
    })
    setForm({ ...form, name: '', description: '' })
    toast(es ? 'Evento creado' : 'Event created')
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <p className="muted">
        {es
          ? 'Crea los eventos de cada comité. Al escanear QR con un evento elegido, la asistencia queda registrada en ese evento.'
          : 'Create each committee’s events. Scanning QR codes with an event selected records attendance for that event.'}
      </p>
      <div className="card stack">
        <div className="grid2" style={{ gap: 10 }}>
          <label className="field">
            {es ? 'Nombre del evento' : 'Event name'}
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            {es ? 'Comité' : 'Committee'}
            <select className="input" value={form.committee} onChange={(e) => setForm({ ...form, committee: e.target.value })}>
              {COMMITTEES.map((c) => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
            </select>
          </label>
          <label className="field">
            {es ? 'Fecha' : 'Date'}
            <input className="input" type="date" disabled={form.allYear} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="row" style={{ fontSize: 14, gap: 8, alignSelf: 'end', paddingBottom: 12 }}>
            <input type="checkbox" checked={form.allYear} onChange={(e) => setForm({ ...form, allYear: e.target.checked })} />
            {es ? 'Programa de todo el año (sin fecha)' : 'All-year program (no date)'}
          </label>
          <label className="field">
            {es ? 'Puntos para el ranking' : 'Ranking points'}
            <input className="input" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </label>
        </div>
        <textarea className="input" rows={2} placeholder={es ? 'Descripción (opcional)' : 'Description (optional)'} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn grad" style={{ justifySelf: 'start' }} onClick={add}>{es ? 'Crear evento' : 'Create event'}</button>
      </div>
      {(events || []).slice().reverse().map((e) => <EventAdmin key={e.id} e={e} toast={toast} />)}
      {events?.length === 0 && <p className="faint">{es ? 'Aún no hay eventos.' : 'No events yet.'}</p>}
    </div>
  )
}

function EventAdmin({ e, toast }: { e: GhEvent; toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { member } = useAuth()
  const [text, setText] = useState('')
  const addFeedback = async () => {
    if (!text.trim()) return
    await addDoc(collection(db, 'events', e.id, 'feedback'), { text: text.trim(), byName: member?.name || 'GH', at: serverTimestamp() })
    setText('')
    toast(es ? 'Feedback guardado' : 'Feedback saved')
  }
  return (
    <div className="card stack" style={{ gap: 10 }}>
      <div className="spread" style={{ flexWrap: 'wrap' }}>
        <div>
          <b>{e.name}</b>
          <div className="faint" style={{ fontSize: 13 }}>
            {fmtDate(e.date, lang)} · {committeeName(e.committee, lang)} · {e.points} pts · {e.attendees?.length || 0} {es ? 'asistentes' : 'attendees'}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
<button className="btn ghost sm" onClick={() => confirm(es ? '¿Eliminar evento?' : 'Delete event?') && deleteDoc(doc(db, 'events', e.id))}>✕</button>
        </div>
      </div>
      <div className="row">
        <input className="input" placeholder={es ? 'Agregar feedback de este evento' : 'Add feedback for this event'} value={text} onChange={(ev) => setText(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && addFeedback()} />
        <button className="btn sm" onClick={addFeedback}>{es ? 'Guardar' : 'Save'}</button>
      </div>
    </div>
  )
}
