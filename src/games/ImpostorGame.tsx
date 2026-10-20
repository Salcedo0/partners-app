import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, doc, getDocs, increment, onSnapshot, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useI18n, type Bi } from '../i18n'
import { Avatar } from '../ui'
import { PlayerChips, type GameProps } from './Room'
import { shuffle } from './rooms'

const CATEGORIES: Record<string, { name: Bi; words: Bi[] }> = {
  partners: {
    name: { es: 'Partners', en: 'Partners' },
    words: [
      { es: 'Noche Internacional', en: 'International Night' },
      { es: 'Voluntariado', en: 'Volunteering' },
      { es: 'Intercambio', en: 'Exchange' },
      { es: 'Carpa', en: 'Tent' },
      { es: 'Porra', en: 'Chant' },
      { es: 'Escarapela', en: 'Badge' },
      { es: 'Fundación', en: 'Foundation' },
      { es: 'Bandera', en: 'Flag' },
    ],
  },
  medellin: {
    name: { es: 'Medellín', en: 'Medellín' },
    words: [
      { es: 'Metro', en: 'Metro' },
      { es: 'Arepa', en: 'Arepa' },
      { es: 'Feria de las Flores', en: 'Flower Festival' },
      { es: 'Silleta', en: 'Silleta' },
      { es: 'Bandeja paisa', en: 'Bandeja paisa' },
      { es: 'Parque Arví', en: 'Arví Park' },
      { es: 'Comuna 13', en: 'Comuna 13' },
      { es: 'Tinto', en: 'Black coffee' },
    ],
  },
  campus: {
    name: { es: 'Vida universitaria', en: 'Campus life' },
    words: [
      { es: 'Biblioteca', en: 'Library' },
      { es: 'Parcial', en: 'Midterm' },
      { es: 'Cafetería', en: 'Cafeteria' },
      { es: 'Trasnochar', en: 'All-nighter' },
      { es: 'Grupo de estudio', en: 'Study group' },
      { es: 'Matrícula', en: 'Enrollment' },
      { es: 'Profesor', en: 'Professor' },
      { es: 'Laboratorio', en: 'Lab' },
    ],
  },
  world: {
    name: { es: 'Países', en: 'Countries' },
    words: [
      { es: 'México', en: 'Mexico' },
      { es: 'Francia', en: 'France' },
      { es: 'Japón', en: 'Japan' },
      { es: 'Brasil', en: 'Brazil' },
      { es: 'Alemania', en: 'Germany' },
      { es: 'Canadá', en: 'Canada' },
      { es: 'Italia', en: 'Italy' },
      { es: 'Corea del Sur', en: 'South Korea' },
    ],
  },
}

type Secret = { role: 'crew' | 'impostor'; word: string; category: string; round: number }
type Vote = { id: string; uid: string; round: number; for: string }

async function startRound(room: GameProps['room'], players: GameProps['players'], category: string) {
  const cat = CATEGORIES[category] || CATEGORIES.partners
  const word = shuffle(cat.words)[0][room.lang]
  const ids = shuffle(players.map((p) => p.id))
  const impostor = ids[0]
  const starter = shuffle(players.map((p) => p.id))[0]
  const b = writeBatch(db)
  for (const p of players)
    b.set(doc(db, 'rooms', room.id, 'secrets', p.id), {
      role: p.id === impostor ? 'impostor' : 'crew',
      word: p.id === impostor ? '' : word,
      category: cat.name[room.lang],
      round: (room.round || 0) + 1,
    })
  b.update(doc(db, 'rooms', room.id), {
    state: 'reveal',
    round: (room.round || 0) + 1,
    category,
    starter,
    impostor: null,
    word: null,
    accused: null,
    crewWon: null,
  })
  await b.commit()
}

export default function ImpostorGame(props: GameProps) {
  const { room, players, isHost, uid } = props
  const { lang } = useI18n()
  const es = lang === 'es'
  const [secret, setSecret] = useState<Secret | null>(null)
  const [shown, setShown] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const advancing = useRef('')

  useEffect(() => onSnapshot(doc(db, 'rooms', room.id, 'secrets', uid), (s) => setSecret(s.exists() ? (s.data() as Secret) : null)), [room.id, uid])
  useEffect(() => setShown(false), [room.round])
  useEffect(
    () =>
      onSnapshot(query(collection(db, 'rooms', room.id, 'votes'), where('round', '==', room.round)), (s) =>
        setVotes(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Vote)),
      ),
    [room.id, room.round],
  )
  const voteDone = useMemo(() => new Set(votes.map((v) => v.uid)), [votes])
  const starter = players.find((p) => p.id === room.starter)

  const reveal = async () => {
    // Only the host can list everyone's cards (see firestore.rules).
    const cards = await getDocs(collection(db, 'rooms', room.id, 'secrets'))
    const current = cards.docs.filter((d) => d.data().round === room.round)
    const impCard = current.find((d) => d.data().role === 'impostor')
    if (!impCard) return
    const saved = { impostor: impCard.id, word: current.find((d) => d.data().role === 'crew')?.data().word || '' }
    const tally = new Map<string, number>()
    votes.forEach((v) => tally.set(v.for, (tally.get(v.for) || 0) + 1))
    const max = Math.max(0, ...tally.values())
    const top = [...tally.entries()].filter(([, n]) => n === max).map(([id]) => id)
    // A tie means the group couldn't agree: the impostor escapes.
    const accused = top.length === 1 ? top[0] : null
    const crewWon = accused === saved.impostor
    const b = writeBatch(db)
    for (const p of players) {
      const gain = p.id === saved.impostor ? (crewWon ? 0 : 300) : crewWon ? 100 : 0
      if (gain) b.update(doc(db, 'rooms', room.id, 'players', p.id), { score: increment(gain) })
    }
    b.update(doc(db, 'rooms', room.id), { state: 'result', impostor: saved.impostor, word: saved.word, accused, crewWon })
    await b.commit()
  }

  useEffect(() => {
    if (!isHost || room.state !== 'voting') return
    const key = `v:${room.round}`
    if (advancing.current !== key && voteDone.size >= players.length) {
      advancing.current = key
      void reveal()
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  if (room.state === 'reveal')
    return (
      <div className="stack" style={{ gap: 16 }}>
        <span className="chip" style={{ justifySelf: 'start' }}>{es ? 'Ronda' : 'Round'} {room.round}</span>
        {!secret || secret.round !== room.round ? (
          <div className="card" style={{ textAlign: 'center' }}>
            {es ? 'Entraste a mitad de ronda. Juegas en la siguiente.' : 'You joined mid-round. You’ll play next round.'}
          </div>
        ) : shown ? (
          <button className="vote-card" onClick={() => setShown(false)} style={{ width: '100%' }}>
            <div className={'impostor-card ' + (secret.role === 'impostor' ? 'imp' : 'crew')}>
              <span className="kicker" style={{ color: '#fff', opacity: 0.85 }}>{secret.category}</span>
              <div className="word">{secret.role === 'impostor' ? (es ? 'Eres el impostor' : 'You’re the impostor') : secret.word}</div>
              <span style={{ opacity: 0.85, fontSize: 14 }}>
                {secret.role === 'impostor'
                  ? es ? 'Escucha a los demás y finge que sabes la palabra.' : 'Listen to the others and pretend you know the word.'
                  : es ? 'Di algo relacionado sin regalar la palabra.' : 'Say something related without giving the word away.'}
              </span>
              <small style={{ opacity: 0.7 }}>{es ? 'Toca para ocultar' : 'Tap to hide'}</small>
            </div>
          </button>
        ) : (
          <button className="hidden-card" onClick={() => setShown(true)}>
            <div style={{ fontSize: 48 }}>🤫</div>
            <b style={{ fontSize: 20 }}>{es ? 'Toca para ver tu carta' : 'Tap to see your card'}</b>
            <small style={{ opacity: 0.7 }}>{es ? 'Que nadie más vea tu pantalla' : 'Don’t let anyone see your screen'}</small>
          </button>
        )}
        <div className="card stack">
          <b>{es ? 'Cómo se juega' : 'How to play'}</b>
          <p className="muted" style={{ fontSize: 14 }}>
            {es
              ? `Por turnos, cada persona dice UNA palabra relacionada. Empieza ${starter?.name.split(' ')[0] || '…'}. Después de una o dos vueltas, voten quién creen que es el impostor.`
              : `Taking turns, each person says ONE related word. ${starter?.name.split(' ')[0] || '…'} starts. After one or two rounds, vote for who you think the impostor is.`}
          </p>
        </div>
        {isHost && (
          <button className="btn grad" onClick={() => updateDoc(doc(db, 'rooms', room.id), { state: 'voting' })}>
            {es ? 'Abrir votación' : 'Open voting'} →
          </button>
        )}
      </div>
    )

  if (room.state === 'voting') {
    const mine = votes.find((v) => v.uid === uid)
    return (
      <div className="stack" style={{ gap: 16 }}>
        <div className="spread">
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>{es ? '¿Quién es el impostor?' : 'Who’s the impostor?'}</h2>
          <span className="chip">{voteDone.size}/{players.length}</span>
        </div>
        <div className="rank-list">
          {players.map((p) => (
            <button
              key={p.id}
              className="rank-row"
              style={{ border: 0, textAlign: 'left', gridTemplateColumns: '40px 1fr auto', outline: mine?.for === p.id ? '3px solid var(--salmon)' : undefined }}
              disabled={!!mine || p.id === uid}
              onClick={() => setDoc(doc(db, 'rooms', room.id, 'votes', `${room.round}_${uid}`), { uid, round: room.round, for: p.id })}
            >
              <Avatar name={p.name} photo={p.photo} />
              <span className="nm">{p.name}{p.id === uid ? (es ? ' (tú)' : ' (you)') : ''}</span>
              <span>{mine?.for === p.id ? '🗳️' : ''}</span>
            </button>
          ))}
        </div>
        <PlayerChips players={players} done={voteDone} />
        {isHost && (
          <button className="btn ghost" onClick={() => { advancing.current = `v:${room.round}`; void reveal() }}>
            {es ? 'Revelar ya' : 'Reveal now'} →
          </button>
        )}
      </div>
    )
  }

  // result
  const imp = players.find((p) => p.id === room.impostor)
  const acc = players.find((p) => p.id === room.accused)
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className={'impostor-card ' + (room.crewWon ? 'crew' : 'imp')}>
        <span className="kicker" style={{ color: '#fff' }}>{room.crewWon ? (es ? '¡Lo atraparon!' : 'Caught!') : es ? '¡El impostor escapó!' : 'The impostor escaped!'}</span>
        <div className="word" style={{ fontSize: 34 }}>{imp?.name || '—'}</div>
        <span style={{ opacity: 0.9 }}>
          {es ? 'La palabra era' : 'The word was'} <b>{room.word}</b>
          {acc && !room.crewWon ? ` · ${es ? 'acusaron a' : 'they accused'} ${acc.name.split(' ')[0]}` : ''}
        </span>
      </div>
      <div className="card" style={{ padding: 12 }}>
        {players.map((p, i) => (
          <div key={p.id} className="spread" style={{ padding: 6 }}>
            <span><b className="faint">{i + 1}.</b> {p.name}</span>
            <b>{p.score}</b>
          </div>
        ))}
      </div>
      {isHost && (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn grad" onClick={() => startRound(room, players, room.category || 'partners')}>
            {es ? 'Otra ronda' : 'Another round'}
          </button>
          <button className="btn ghost" onClick={() => updateDoc(doc(db, 'rooms', room.id), { state: 'final' })}>
            {es ? 'Terminar' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  )
}

function Setup({ room, players, min }: GameProps & { min: number }) {
  const { lang, L } = useI18n()
  const es = lang === 'es'
  const [category, setCategory] = useState('partners')
  return (
    <div className="card stack">
      <b>{es ? 'Categoría' : 'Category'}</b>
      <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
        {Object.entries(CATEGORIES).map(([id, c]) => (
          <button key={id} className={category === id ? 'on' : ''} onClick={() => setCategory(id)}>{L(c.name)}</button>
        ))}
      </div>
      <button className="btn grad block" disabled={players.length < min} onClick={() => startRound(room, players, category)}>
        {players.length < min ? (es ? `Mínimo ${min} jugadores` : `At least ${min} players`) : es ? 'Repartir cartas' : 'Deal cards'}
      </button>
    </div>
  )
}

ImpostorGame.Setup = Setup
