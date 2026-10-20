import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, type Query, type DocumentData } from 'firebase/firestore'
import { db } from './firebase'
import { rankSort, type Member } from './db'

/** Live list of documents for a query; `null` while loading. */
export function useLive<T>(q: Query<DocumentData> | null, deps: unknown[]): T[] | null {
  const [rows, setRows] = useState<T[] | null>(null)
  useEffect(() => {
    if (!q) {
      setRows(null)
      return
    }
    return onSnapshot(
      q,
      (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
      (e) => {
        console.error(e)
        setRows([])
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return rows
}

/** All members, already in ranking order. */
export function useRanking(enabled: boolean) {
  const rows = useLive<Member>(enabled ? query(collection(db, 'members')) : null, [enabled])
  return rows ? [...rows].sort(rankSort) : null
}
