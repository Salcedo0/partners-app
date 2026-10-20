import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../firebase'
import { awardPoints, type Member } from '../db'
import type { Lang } from '../i18n'

export type GameKind = 'meme' | 'impostor'

export type Room = {
  id: string
  game: GameKind
  host: string
  hostName: string
  lang: Lang
  state: string
  round: number
  createdAt: Timestamp | null
  bonusGiven?: boolean
  // meme
  rounds?: number
  templateId?: string
  usedTemplates?: string[]
  deadline?: number
  // impostor
  category?: string
  starter?: string
  impostor?: string
  word?: string
  accused?: string | null
  crewWon?: boolean
}

export type Player = { id: string; name: string; photo: string; score: number }

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

export async function createRoom(game: GameKind, user: User, member: Member | null, lang: Lang, extra: Partial<Room> = {}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
    const ref = doc(db, 'rooms', code)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, {
      game,
      host: user.uid,
      hostName: member?.name || user.displayName || 'Host',
      lang,
      state: 'lobby',
      round: 0,
      createdAt: serverTimestamp(),
      ...extra,
    })
    await joinRoom(code, user, member)
    return code
  }
  throw new Error('Could not allocate a room code')
}

export async function joinRoom(code: string, user: User, member: Member | null) {
  const ref = doc(db, 'rooms', code, 'players', user.uid)
  if ((await getDoc(ref)).exists()) return
  await setDoc(ref, {
    name: member?.name || user.displayName || 'Partner',
    photo: member?.photo || '',
    score: 0,
    joinedAt: serverTimestamp(),
  })
}

/** GH-hosted rooms turn the final podium into small tie-breaker bonuses: 3 / 2 / 1. */
export const BONUS = [3, 2, 1]

export async function giveRoomBonus(room: Room, players: Player[], byUid: string, byName: string, label: string) {
  const top = [...players].filter((p) => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
  for (let i = 0; i < top.length; i++) {
    await awardPoints({
      member: { id: top[i].id, name: top[i].name },
      points: BONUS[i],
      kind: 'game',
      reason: `${label} · ${room.id}`,
      byUid,
      byName,
    })
  }
  await setDoc(doc(db, 'rooms', room.id), { bonusGiven: true }, { merge: true })
  return top.length
}

export const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
