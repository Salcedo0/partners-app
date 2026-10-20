import {
  collection,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type Member = {
  id: string
  name: string
  email: string
  photo: string
  committee: string
  points: number
  bonus: number
}

export type Txn = {
  id: string
  uid: string
  memberName: string
  points: number
  kind: 'activity' | 'game'
  reason: string
  byName: string
  at: Timestamp | null
}

export type Activity = { id: string; name: string; points: number }

export type MemeBox = { x: number; y: number; w: number; h: number }
export type MemeTemplate = {
  id: string
  title: string
  image: string
  /** width / height */
  ratio: number
  boxes: MemeBox[]
  approved: boolean
}

/** QR payload for a member. Kept short so the code stays easy to scan. */
export const QR_PREFIX = 'PCE:'
export const qrFor = (uid: string) => QR_PREFIX + uid
export const uidFromQr = (text: string) => (text.startsWith(QR_PREFIX) ? text.slice(QR_PREFIX.length) : null)

/** Ranking: activity points first, game bonus only breaks ties. */
export const rankSort = (a: Member, b: Member) =>
  b.points - a.points || b.bonus - a.bonus || a.name.localeCompare(b.name)

/** Admin-only (enforced by rules): log the transaction and bump the member's counter atomically. */
export async function awardPoints(opts: {
  member: Pick<Member, 'id' | 'name'>
  points: number
  kind: 'activity' | 'game'
  reason: string
  byUid: string
  byName: string
}) {
  const b = writeBatch(db)
  b.set(doc(collection(db, 'transactions')), {
    uid: opts.member.id,
    memberName: opts.member.name,
    points: opts.points,
    kind: opts.kind,
    reason: opts.reason,
    by: opts.byUid,
    byName: opts.byName,
    at: serverTimestamp(),
  })
  b.update(doc(db, 'members', opts.member.id), {
    [opts.kind === 'game' ? 'bonus' : 'points']: increment(opts.points),
  })
  await b.commit()
}
