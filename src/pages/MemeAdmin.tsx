import { useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useAuth } from '../auth'
import type { MemeBox, MemeTemplate } from '../db'
import { db } from '../firebase'
import { useLive } from '../hooks'
import { useI18n } from '../i18n'
import { MemeView } from '../Meme'

type Draft = { id?: string; title: string; image: string; ratio: number; boxes: MemeBox[]; approved: boolean }

/** Downscale to keep each template well under Firestore's 1 MB document limit. */
async function compress(file: File): Promise<{ image: string; ratio: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const max = 900
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * scale)
    c.height = Math.round(img.height * scale)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    let q = 0.82
    let out = c.toDataURL('image/jpeg', q)
    while (out.length > 700_000 && q > 0.4) out = c.toDataURL('image/jpeg', (q -= 0.1))
    return { image: out, ratio: c.width / c.height }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function MemeAdmin({ toast }: { toast: (m: string) => void }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user } = useAuth()
  const templates = useLive<MemeTemplate>(query(collection(db, 'memeTemplates')), [])
  const [draft, setDraft] = useState<Draft | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = async (f?: File) => {
    if (!f) return
    const { image, ratio } = await compress(f)
    setDraft({
      title: f.name.replace(/\.[^.]+$/, ''),
      image,
      ratio,
      approved: true,
      boxes: [
        { x: 5, y: 3, w: 90, h: 18 },
        { x: 5, y: 79, w: 90, h: 18 },
      ],
    })
  }

  const save = async () => {
    if (!draft) return
    const data = { title: draft.title, image: draft.image, ratio: draft.ratio, boxes: draft.boxes, approved: draft.approved }
    if (draft.id) await updateDoc(doc(db, 'memeTemplates', draft.id), data)
    else await addDoc(collection(db, 'memeTemplates'), { ...data, by: user!.uid, createdAt: serverTimestamp() })
    toast(es ? 'Plantilla guardada' : 'Template saved')
    setDraft(null)
  }

  if (draft) return <Editor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setDraft(null)} />

  return (
    <div className="stack">
      <div className="spread" style={{ flexWrap: 'wrap' }}>
        <p className="muted" style={{ maxWidth: 560 }}>
          {es
            ? 'Sube las imágenes para Make it Meme y ubica los recuadros de texto. Solo las aprobadas aparecen en el juego.'
            : 'Upload images for Make it Meme and place the text boxes. Only approved ones show up in the game.'}
        </p>
        <button className="btn grad" onClick={() => fileRef.current?.click()}>
          {es ? '+ Subir imagen' : '+ Upload image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div className="tpl-grid">
        {(templates || []).map((tp) => (
          <div className="tpl" key={tp.id}>
            <MemeView image={tp.image} ratio={tp.ratio || 1} boxes={tp.boxes} texts={tp.boxes.map((_, i) => `${es ? 'Texto' : 'Text'} ${i + 1}`)} />
            <div>
              <div className="spread">
                <b style={{ fontSize: 14 }}>{tp.title}</b>
                <span className="chip" style={tp.approved ? { background: '#e8f3ec', color: '#24563a' } : undefined}>
                  {tp.approved ? (es ? 'Aprobada' : 'Approved') : es ? 'Borrador' : 'Draft'}
                </span>
              </div>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <button className="btn ghost sm" onClick={() => setDraft({ ...tp, ratio: tp.ratio || 1 })}>{es ? 'Editar' : 'Edit'}</button>
                <button className="btn ghost sm" onClick={() => updateDoc(doc(db, 'memeTemplates', tp.id), { approved: !tp.approved })}>
                  {tp.approved ? (es ? 'Ocultar' : 'Hide') : es ? 'Aprobar' : 'Approve'}
                </button>
                <button
                  className="btn ghost sm"
                  onClick={() => confirm(es ? '¿Eliminar plantilla?' : 'Delete template?') && deleteDoc(doc(db, 'memeTemplates', tp.id))}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {templates?.length === 0 && <p className="faint">{es ? 'Aún no hay plantillas.' : 'No templates yet.'}</p>}
    </div>
  )
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  onSave: () => void
  onCancel: () => void
}) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<{ i: number; mode: 'move' | 'resize'; sx: number; sy: number; box: MemeBox } | null>(null)

  const setBox = (i: number, b: MemeBox) => setDraft({ ...draft, boxes: draft.boxes.map((x, j) => (j === i ? b : x)) })
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  const onDown = (e: React.PointerEvent, i: number, mode: 'move' | 'resize') => {
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { i, mode, sx: e.clientX, sy: e.clientY, box: draft.boxes[i] }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || !stage.current) return
    const r = stage.current.getBoundingClientRect()
    const dx = ((e.clientX - d.sx) / r.width) * 100
    const dy = ((e.clientY - d.sy) / r.height) * 100
    const b = d.box
    if (d.mode === 'move') setBox(d.i, { ...b, x: clamp(b.x + dx, 0, 100 - b.w), y: clamp(b.y + dy, 0, 100 - b.h) })
    else setBox(d.i, { ...b, w: clamp(b.w + dx, 8, 100 - b.x), h: clamp(b.h + dy, 5, 100 - b.y) })
  }
  const onUp = () => (drag.current = null)

  return (
    <div className="grid2" style={{ alignItems: 'start' }}>
      <div
        ref={stage}
        className="meme editor-stage"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <img src={draft.image} alt="" draggable={false} />
        {draft.boxes.map((b, i) => (
          <div
            key={i}
            className="meme-box edit"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            onPointerDown={(e) => onDown(e, i, 'move')}
          >
            {es ? 'Texto' : 'Text'} {i + 1}
            <button
              className="x"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setDraft({ ...draft, boxes: draft.boxes.filter((_, j) => j !== i) })}
            >
              ✕
            </button>
            <span className="handle" onPointerDown={(e) => onDown(e, i, 'resize')} />
          </div>
        ))}
      </div>
      <div className="card stack">
        <label className="field">
          {es ? 'Nombre de la plantilla' : 'Template name'}
          <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>
        <p className="faint" style={{ fontSize: 13 }}>
          {es
            ? 'Arrastra los recuadros para moverlos y usa la esquina naranja para cambiar su tamaño.'
            : 'Drag boxes to move them and use the orange corner to resize.'}
        </p>
        <button
          className="btn ghost"
          disabled={draft.boxes.length >= 4}
          onClick={() => setDraft({ ...draft, boxes: [...draft.boxes, { x: 25, y: 40, w: 50, h: 16 }] })}
        >
          {es ? '+ Agregar recuadro' : '+ Add text box'} ({draft.boxes.length}/4)
        </button>
        <label className="row" style={{ fontSize: 14, gap: 8 }}>
          <input type="checkbox" checked={draft.approved} onChange={(e) => setDraft({ ...draft, approved: e.target.checked })} />
          {es ? 'Aprobada para el juego' : 'Approved for the game'}
        </label>
        <div className="row">
          <button className="btn grad" disabled={!draft.boxes.length} onClick={onSave}>{es ? 'Guardar' : 'Save'}</button>
          <button className="btn ghost" onClick={onCancel}>{es ? 'Cancelar' : 'Cancel'}</button>
        </div>
      </div>
    </div>
  )
}
