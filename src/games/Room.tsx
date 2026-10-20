import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../auth'
import { db } from '../firebase'
import { useI18n } from '../i18n'
import { Avatar, Gate, useToast } from '../ui'
import { giveRoomBonus, joinRoom, type Player, type Room as RoomT } from './rooms'
import MemeGame from './MemeGame'
import ImpostorGame from './ImpostorGame'

export default function Room() {
  return (
    <Gate>
      <RoomInner />
    </Gate>
  )
}

export type GameProps = {
  room: RoomT
  players: Player[]
  isHost: boolean
  uid: string
  toast: (m: string) => void
}

function RoomInner() {
  const { code = '' } = useParams()
  const { user, member } = useAuth()
  const { lang } = useI18n()
  const es = lang === 'es'
  const [room, setRoom] = useState<RoomT | null | undefined>(undefined)
  const [players, setPlayers] = useState<Player[]>([])
  const toast = useToast()

  useEffect(() => {
    const u1 = onSnapshot(doc(db, 'rooms', code), (s) => setRoom(s.exists() ? ({ id: s.id, ...s.data() } as RoomT) : null))
    const u2 = onSnapshot(collection(db, 'rooms', code, 'players'), (s) =>
      setPlayers(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Player)),
    )
    return () => {
      u1()
      u2()
    }
  }, [code])

  const joined = players.some((p) => p.id === user!.uid)
  useEffect(() => {
    if (room && !joined) joinRoom(code, user!, member).catch(console.error)
  }, [room?.id, joined]) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  if (room === undefined) return <div className="center faint">…</div>
  if (room === null)
    return (
      <div className="center">
        <h2>{es ? 'Esa sala no existe' : 'That room doesn’t exist'}</h2>
        <Link className="btn ghost" to="/juegos">{es ? 'Volver a juegos' : 'Back to games'}</Link>
      </div>
    )

  const isHost = room.host === user!.uid
  const props: GameProps = { room, players: sorted, isHost, uid: user!.uid, toast: toast.show }
  const title = room.game === 'meme' ? 'Make it Meme' : es ? 'Impostor' : 'Impostor'

  return (
    <div className="narrow page stack" style={{ gap: 20 }}>
      <div className="spread">
        <div>
          <span className="kicker">{title}</span>
          <div className="faint" style={{ fontSize: 13 }}>{es ? 'Sala de' : 'Hosted by'} {room.hostName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="faint" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em' }}>{es ? 'CÓDIGO' : 'CODE'}</div>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '.12em' }}>{room.id}</div>
        </div>
      </div>

      {room.state === 'lobby' ? (
        <Lobby {...props} />
      ) : room.state === 'final' ? (
        <Final {...props} />
      ) : room.game === 'meme' ? (
        <MemeGame {...props} />
      ) : (
        <ImpostorGame {...props} />
      )}
      {toast.node}
    </div>
  )
}

export function PlayerChips({ players, done }: { players: Player[]; done?: Set<string> }) {
  return (
    <div className="players">
      {players.map((p) => (
        <span key={p.id} className={'player' + (done?.has(p.id) ? ' done' : '')}>
          <Avatar name={p.name} photo={p.photo} />
          {p.name.split(' ')[0]}
        </span>
      ))}
    </div>
  )
}

function Lobby(props: GameProps) {
  const { room, players, isHost } = props
  const { lang } = useI18n()
  const es = lang === 'es'
  const min = room.game === 'impostor' ? 3 : 2
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="card stack" style={{ justifyItems: 'center', textAlign: 'center', padding: 32 }}>
        <span className="faint">{es ? 'Entren a Juegos y escriban el código' : 'Open Games and enter the code'}</span>
        <div className="room-code">{room.id}</div>
        <span className="faint" style={{ fontSize: 13 }}>{location.host}/sala/{room.id}</span>
      </div>
      <div className="stack">
        <b>{players.length} {es ? 'jugadores' : 'players'}</b>
        <PlayerChips players={players} />
      </div>
      {isHost ? (
        room.game === 'meme' ? (
          <MemeGame.Setup {...props} min={min} />
        ) : (
          <ImpostorGame.Setup {...props} min={min} />
        )
      ) : (
        <p className="faint" style={{ textAlign: 'center' }}>{es ? 'Esperando a que el anfitrión empiece…' : 'Waiting for the host to start…'}</p>
      )}
    </div>
  )
}

function Final({ room, players, isHost, uid, toast }: GameProps) {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { isAdmin, member } = useAuth()
  const [busy, setBusy] = useState(false)
  const label = room.game === 'meme' ? 'Make it Meme' : 'Impostor'
  const medals = ['🥇', '🥈', '🥉']

  const give = async () => {
    setBusy(true)
    try {
      const n = await giveRoomBonus(room, players, uid, member?.name || 'GH', label)
      toast(es ? `Bonus asignado a ${n} jugadores` : `Bonus given to ${n} players`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center' }}>{es ? '¡Fin del juego!' : 'Game over!'}</h2>
      <div className="rank-list">
        {players.map((p, i) => (
          <div className="rank-row" key={p.id}>
            <span className="pos">{medals[i] || i + 1}</span>
            <Avatar name={p.name} photo={p.photo} />
            <div className="nm">{p.name}</div>
            <div className="sc">{p.score}</div>
          </div>
        ))}
      </div>
      {isHost && isAdmin && (
        <div className="card stack">
          <b>{es ? 'Bonus de desempate' : 'Tie-breaker bonus'}</b>
          <p className="faint" style={{ fontSize: 14 }}>
            {es ? 'Suma 3, 2 y 1 puntos de bonus al podio de esta sala.' : 'Adds 3, 2 and 1 bonus points to this room’s podium.'}
          </p>
          <button className="btn grad" disabled={busy || room.bonusGiven} onClick={give}>
            {room.bonusGiven ? (es ? 'Bonus ya asignado ✓' : 'Bonus already given ✓') : es ? 'Asignar bonus' : 'Give bonus'}
          </button>
        </div>
      )}
      <Link className="btn ghost" to="/juegos">{es ? 'Volver a juegos' : 'Back to games'}</Link>
    </div>
  )
}
