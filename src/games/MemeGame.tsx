import { useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { MemeTemplate } from '../db'
import { useI18n } from '../i18n'
import { MemeView } from '../Meme'
import { PlayerChips, type GameProps } from './Room'
import { shuffle } from './rooms'

const WRITE_MS = 80_000
const VOTE_POINTS = 100

type Sub = { id: string; uid: string; name: string; round: number; texts: string[] }
type Vote = { id: string; uid: string; round: number; for: string }

const tplCache = new Map<string, MemeTemplate>()
function useTemplate(id?: string) {
  const [tpl, setTpl] = useState<MemeTemplate | null>(id ? tplCache.get(id) || null : null)
  useEffect(() => {
    if (!id) return
    if (tplCache.has(id)) return setTpl(tplCache.get(id)!)
    getDoc(doc(db, 'memeTemplates', id)).then((s) => {
      if (!s.exists()) return
      const t = { id: s.id, ...s.data() } as MemeTemplate
      tplCache.set(id, t)
      setTpl(t)
    })
  }, [id])
  return tpl
}

function useRoundDocs<T>(roomId: string, sub: 'subs' | 'votes', round: number) {
  const [rows, setRows] = useState<T[]>([])
  useEffect(
    () =>
      onSnapshot(query(collection(db, 'rooms', roomId, sub), where('round', '==', round)), (s) =>
        setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
      ),
    [roomId, sub, round],
  )
  return rows
}

async function startRound(room: GameProps['room'], toast: (m: string) => void, es: boolean) {
  const snap = await getDocs(query(collection(db, 'memeTemplates'), where('approved', '==', true)))
  const all = snap.docs.map((d) => d.id)
  if (!all.length) {
    toast(es ? 'GH aún no ha aprobado plantillas de memes' : 'GH hasn’t approved any meme templates yet')
    return
  }
  const used = room.usedTemplates || []
  const fresh = all.filter((id) => !used.includes(id))
  const pick = shuffle(fresh.length ? fresh : all)[0]
  await updateDoc(doc(db, 'rooms', room.id), {
    state: 'writing',
    round: (room.round || 0) + 1,
    templateId: pick,
    usedTemplates: [...used, pick],
    deadline: Date.now() + WRITE_MS,
  })
}

function useNow(ms = 500) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

export default function MemeGame(props: GameProps) {
  const { room, players, isHost, uid, toast } = props
  const { lang } = useI18n()
  const es = lang === 'es'
  const tpl = useTemplate(room.templateId)
  const subs = useRoundDocs<Sub>(room.id, 'subs', room.round)
  const votes = useRoundDocs<Vote>(room.id, 'votes', room.round)
  const now = useNow()
  const advancing = useRef('')

  const subDone = useMemo(() => new Set(subs.map((s) => s.uid)), [subs])
  const voteDone = useMemo(() => new Set(votes.map((v) => v.uid)), [votes])
  const remaining = Math.max(0, Math.ceil(((room.deadline || 0) - now) / 1000))

  const toVoting = async () => {
    await updateDoc(doc(db, 'rooms', room.id), { state: subs.length ? 'voting' : 'results' })
  }
  const toResults = async () => {
    const b = writeBatch(db)
    const tally = new Map<string, number>()
    votes.forEach((v) => tally.set(v.for, (tally.get(v.for) || 0) + 1))
    tally.forEach((n, author) => {
      if (players.some((p) => p.id === author))
        b.update(doc(db, 'rooms', room.id, 'players', author), { score: increment(n * VOTE_POINTS) })
    })
    b.update(doc(db, 'rooms', room.id), { state: 'results' })
    await b.commit()
  }

  // Host moves the room forward when everyone is done or time runs out.
  useEffect(() => {
    if (!isHost) return
    const key = `${room.state}:${room.round}`
    if (advancing.current === key) return
    if (room.state === 'writing' && (subDone.size >= players.length || now > (room.deadline || 0) + 1500)) {
      advancing.current = key
      void toVoting()
    } else if (room.state === 'voting' && subs.length > 0 && voteDone.size >= players.length) {
      advancing.current = key
      void toResults()
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tpl) return <div className="center faint">…</div>

  if (room.state === 'writing')
    return (
      <Writing
        key={room.round}
        tpl={tpl}
        submitted={subDone.has(uid)}
        remaining={remaining}
        round={room.round}
        rounds={room.rounds || 3}
        onSubmit={(texts) =>
          setDoc(doc(db, 'rooms', room.id, 'subs', `${room.round}_${uid}`), {
            uid,
            name: players.find((p) => p.id === uid)?.name || '',
            round: room.round,
            texts,
          })
        }
        footer={
          <>
            <PlayerChips players={players} done={subDone} />
            {isHost && (
              <button className="btn ghost" onClick={() => { advancing.current = `writing:${room.round}`; void toVoting() }}>
                {es ? 'Pasar a votación' : 'Go to voting'} →
              </button>
            )}
          </>
        }
      />
    )

  if (room.state === 'voting') {
    const myVote = votes.find((v) => v.uid === uid)
    const ordered = shuffleStable(subs, room.id + room.round)
    return (
      <div className="stack" style={{ gap: 16 }}>
        <div className="spread">
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>{es ? '¡Vota por el mejor!' : 'Vote for the best one!'}</h2>
          <span className="chip">{voteDone.size}/{players.length}</span>
        </div>
        <div className="vote-grid">
          {ordered.map((s) => (
            <button
              key={s.id}
              className={'vote-card' + (myVote?.for === s.uid ? ' on' : '')}
              disabled={s.uid === uid || !!myVote}
              onClick={() =>
                setDoc(doc(db, 'rooms', room.id, 'votes', `${room.round}_${uid}`), { uid, round: room.round, for: s.uid })
              }
            >
              <MemeView image={tpl.image} ratio={tpl.ratio || 1} boxes={tpl.boxes} texts={s.texts} />
              {s.uid === uid && <small className="faint">{es ? 'Tu meme' : 'Your meme'}</small>}
            </button>
          ))}
        </div>
        {isHost && (
          <button className="btn ghost" onClick={() => { advancing.current = `voting:${room.round}`; void toResults() }}>
            {es ? 'Ver resultados' : 'Show results'} →
          </button>
        )}
      </div>
    )
  }

  // results
  const count = (author: string) => votes.filter((v) => v.for === author).length
  const ranked = [...subs].sort((a, b) => count(b.uid) - count(a.uid))
  const last = room.round >= (room.rounds || 3)
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800 }}>
        {es ? `Resultados · ronda ${room.round}` : `Results · round ${room.round}`}
      </h2>
      <div className="vote-grid">
        {ranked.map((s, i) => (
          <div key={s.id} className="stack" style={{ gap: 8 }}>
            <MemeView image={tpl.image} ratio={tpl.ratio || 1} boxes={tpl.boxes} texts={s.texts} />
            <div className="spread">
              <b>{i === 0 && count(s.uid) > 0 ? '👑 ' : ''}{s.name}</b>
              <span className="chip">{count(s.uid)} {count(s.uid) === 1 ? (es ? 'voto' : 'vote') : es ? 'votos' : 'votes'}</span>
            </div>
          </div>
        ))}
      </div>
      <Scoreboard players={players} />
      {isHost && (
        <button
          className="btn grad"
          onClick={() => (last ? updateDoc(doc(db, 'rooms', room.id), { state: 'final' }) : startRound(room, toast, es))}
        >
          {last ? (es ? 'Ver podio final' : 'See final podium') : es ? 'Siguiente ronda' : 'Next round'} →
        </button>
      )}
    </div>
  )
}

function Writing({
  tpl,
  submitted,
  remaining,
  round,
  rounds,
  onSubmit,
  footer,
}: {
  tpl: MemeTemplate
  submitted: boolean
  remaining: number
  round: number
  rounds: number
  onSubmit: (texts: string[]) => Promise<void>
  footer: React.ReactNode
}) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const [texts, setTexts] = useState<string[]>(tpl.boxes.map(() => ''))
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="spread">
        <span className="chip">{es ? 'Ronda' : 'Round'} {round}/{rounds}</span>
        <span className="timer" style={{ color: remaining <= 10 ? 'var(--red)' : undefined }}>{remaining}s</span>
      </div>
      <MemeView image={tpl.image} ratio={tpl.ratio || 1} boxes={tpl.boxes} texts={texts} />
      {submitted ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <b>{es ? '¡Listo! Esperando a los demás…' : 'Done! Waiting for the others…'}</b>
        </div>
      ) : (
        <div className="stack">
          {tpl.boxes.map((_, i) => (
            <input
              key={i}
              className="input"
              maxLength={80}
              placeholder={`${es ? 'Texto' : 'Text'} ${i + 1}`}
              value={texts[i]}
              onChange={(e) => setTexts(texts.map((t, j) => (j === i ? e.target.value : t)))}
            />
          ))}
          <button className="btn grad block" disabled={texts.every((t) => !t.trim())} onClick={() => onSubmit(texts)}>
            {es ? 'Enviar meme' : 'Submit meme'}
          </button>
        </div>
      )}
      {footer}
    </div>
  )
}

function Scoreboard({ players }: { players: GameProps['players'] }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      {players.map((p, i) => (
        <div key={p.id} className="spread" style={{ padding: '6px 6px' }}>
          <span><b className="faint">{i + 1}.</b> {p.name}</span>
          <b>{p.score}</b>
        </div>
      ))}
    </div>
  )
}

function shuffleStable<T extends { id: string }>(rows: T[], seed: string) {
  const h = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  return [...rows].sort((a, b) => h(seed + a.id) - h(seed + b.id))
}

function Setup({ room, players, toast, min }: GameProps & { min: number }) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const [rounds, setRounds] = useState(3)
  const [busy, setBusy] = useState(false)
  const start = async () => {
    setBusy(true)
    try {
      await updateDoc(doc(db, 'rooms', room.id), { rounds })
      await startRound({ ...room, rounds }, toast, es)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="card stack">
      <div className="spread">
        <b>{es ? 'Rondas' : 'Rounds'}</b>
        <div className="tabs" style={{ margin: 0 }}>
          {[3, 5, 7].map((n) => (
            <button key={n} className={rounds === n ? 'on' : ''} onClick={() => setRounds(n)}>{n}</button>
          ))}
        </div>
      </div>
      <button className="btn grad block" disabled={busy || players.length < min} onClick={start}>
        {players.length < min ? (es ? `Mínimo ${min} jugadores` : `At least ${min} players`) : es ? 'Empezar' : 'Start'}
      </button>
    </div>
  )
}

MemeGame.Setup = Setup
