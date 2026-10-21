import { useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { HonoraryMark, type Honorary } from '../gh'
import { useLive } from '../hooks'
import { useI18n } from '../i18n'

/** Square-crop and shrink a photo so it fits comfortably in a Firestore doc. */
async function toAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const side = Math.min(img.width, img.height)
    const c = document.createElement('canvas')
    c.width = c.height = 360
    c.getContext('2d')!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 360, 360)
    return c.toDataURL('image/jpeg', 0.8)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function AdminHonorarios({ toast }: { toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const list = useLive<Honorary>(query(collection(db, 'honorarios')), [])
  const sorted = [...(list || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name))
  const [form, setForm] = useState({ name: '', since: '', text: '', photo: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const add = async () => {
    if (!form.name.trim()) return
    await addDoc(collection(db, 'honorarios'), {
      name: form.name.trim(),
      since: form.since.trim(),
      text: form.text.trim(),
      photo: form.photo,
      order: (list?.length || 0) + 1,
      createdAt: serverTimestamp(),
    })
    setForm({ name: '', since: '', text: '', photo: '' })
    toast(es ? 'Honorario agregado' : 'Honorary added')
  }

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 720 }}>
      <p className="muted">
        {es ? 'Los honorarios aparecen en la sección de Honorarios del inicio.' : 'Honoraries appear in the Honoraries section on the home page.'}
      </p>
      <div className="card stack">
        <div className="grid2" style={{ gap: 10 }}>
          <label className="field">
            {es ? 'Nombre' : 'Name'}
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            {es ? 'Miembro desde (año)' : 'Member since (year)'}
            <input className="input" inputMode="numeric" placeholder="2023" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} />
          </label>
        </div>
        <textarea
          className="input"
          rows={3}
          placeholder={es ? 'Trayectoria: cómo se ganó el reconocimiento' : 'Their path: how they earned it'}
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {form.photo ? <img src={form.photo} alt="" className="hono-photo" style={{ width: 56, height: 56 }} /> : <HonoraryMark size={56} />}
          <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>{es ? 'Subir foto (opcional)' : 'Upload photo (optional)'}</button>
          {form.photo && <button className="btn ghost sm" onClick={() => setForm({ ...form, photo: '' })}>✕</button>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) setForm({ ...form, photo: await toAvatar(f) })
              e.target.value = ''
            }}
          />
        </div>
        <button className="btn grad" style={{ justifySelf: 'start' }} onClick={add}>{es ? 'Agregar honorario' : 'Add honorary'}</button>
      </div>
      {sorted.map((h, i) => (
        <div key={h.id} className="card spread" style={{ flexWrap: 'wrap' }}>
          <div className="row">
            {h.photo ? <img src={h.photo} alt="" className="hono-photo" style={{ width: 48, height: 48 }} /> : <HonoraryMark size={48} />}
            <div>
              <b>{h.name}</b>
              <div className="faint" style={{ fontSize: 13 }}>{h.since && `${es ? 'Desde' : 'Since'} ${h.since}`}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn ghost sm"
              disabled={i === 0}
              onClick={() => {
                const prev = sorted[i - 1]
                updateDoc(doc(db, 'honorarios', h.id), { order: prev.order ?? i })
                updateDoc(doc(db, 'honorarios', prev.id), { order: h.order ?? i + 1 })
              }}
              aria-label="up"
            >
              ↑
            </button>
            <button className="btn ghost sm" onClick={() => confirm(es ? '¿Eliminar honorario?' : 'Delete honorary?') && deleteDoc(doc(db, 'honorarios', h.id))}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
