import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, limit, orderBy, query, setDoc } from 'firebase/firestore'
import { useAuth } from '../auth'
import { db } from '../firebase'
import { useLive } from '../hooks'
import { useI18n } from '../i18n'
import { Avatar } from '../ui'

const N = 18
type P = { x: number; y: number }
type Dir = P

export default function Snake() {
  const { lang } = useI18n()
  const es = lang === 'es'
  const { user, member } = useAuth()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [state, setState] = useState<'ready' | 'playing' | 'over'>('ready')
  const dirRef = useRef<Dir>({ x: 1, y: 0 })
  const queue = useRef<Dir[]>([])
  const board = useLive<{ id: string; name: string; photo: string; best: number }>(
    user ? query(collection(db, 'snake'), orderBy('best', 'desc'), limit(10)) : null,
    [!!user],
  )

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'snake', user.uid)).then((s) => s.exists() && setBest(s.data().best || 0))
  }, [user])

  const turn = (d: Dir) => {
    const last = queue.current[queue.current.length - 1] || dirRef.current
    if (last.x + d.x === 0 && last.y + d.y === 0) return
    if (last.x === d.x && last.y === d.y) return
    if (queue.current.length < 3) queue.current.push(d)
  }

  // Keyboard + swipe controls.
  useEffect(() => {
    const keys: Record<string, Dir> = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    }
    const onKey = (e: KeyboardEvent) => {
      const d = keys[e.key]
      if (d) {
        e.preventDefault()
        turn(d)
      }
    }
    window.addEventListener('keydown', onKey)
    const c = canvas.current!
    let sx = 0, sy = 0
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY }
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
      turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) })
    }
    c.addEventListener('touchstart', ts, { passive: true })
    c.addEventListener('touchend', te)
    return () => {
      window.removeEventListener('keydown', onKey)
      c.removeEventListener('touchstart', ts)
      c.removeEventListener('touchend', te)
    }
  }, [])

  // Game loop.
  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const size = c.clientWidth * dpr
    c.width = c.height = size
    const cell = size / N

    let snake: P[] = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }]
    let food = spawn(snake)
    let pts = 0
    let timer = 0

    const draw = () => {
      ctx.fillStyle = '#161a2b'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = 'rgba(255,255,255,0.035)'
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) ctx.fillRect(i * cell, j * cell, cell, cell)
      // food
      ctx.fillStyle = '#fd7c5e'
      ctx.beginPath()
      ctx.arc((food.x + 0.5) * cell, (food.y + 0.5) * cell, cell * 0.36, 0, Math.PI * 2)
      ctx.fill()
      // snake: gradient from salmon (head) to blue (tail), like the logo
      snake.forEach((p, i) => {
        const t = i / Math.max(snake.length - 1, 1)
        const r = Math.round(253 + (78 - 253) * t), g = Math.round(124 + (104 - 124) * t), b = Math.round(94 + (155 - 94) * t)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        const pad = cell * 0.08
        ctx.beginPath()
        ctx.roundRect(p.x * cell + pad, p.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.28)
        ctx.fill()
      })
    }

    const step = () => {
      if (queue.current.length) dirRef.current = queue.current.shift()!
      const d = dirRef.current
      const head = { x: snake[0].x + d.x, y: snake[0].y + d.y }
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some((p) => p.x === head.x && p.y === head.y)) {
        setState('over')
        finish(pts)
        return
      }
      snake = [head, ...snake]
      if (head.x === food.x && head.y === food.y) {
        pts += 10
        setScore(pts)
        food = spawn(snake)
      } else snake.pop()
      draw()
      timer = window.setTimeout(step, Math.max(70, 150 - pts / 2))
    }

    draw()
    if (state === 'playing') {
      dirRef.current = { x: 1, y: 0 }
      queue.current = []
      setScore(0)
      timer = window.setTimeout(step, 300)
    }
    return () => window.clearTimeout(timer)
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const finish = async (pts: number) => {
    if (!user || pts <= best) return
    setBest(pts)
    await setDoc(doc(db, 'snake', user.uid), { best: pts, name: member?.name || user.displayName || '', photo: member?.photo || '' })
  }

  return (
    <div className="narrow page">
      <div className="spread" style={{ marginBottom: 16 }}>
        <Link to="/juegos" className="btn ghost sm">← {es ? 'Juegos' : 'Games'}</Link>
        <div className="row">
          <span className="chip">{es ? 'Puntos' : 'Score'}: <b>{score}</b></span>
          <span className="chip">{es ? 'Récord' : 'Best'}: <b>{best}</b></span>
        </div>
      </div>
      <div className="snake-wrap">
        <div style={{ position: 'relative', width: 'min(100%, 440px)' }}>
          <canvas ref={canvas} className="snake-canvas" style={{ width: '100%' }} />
          {state !== 'playing' && (
            <div className="center" style={{ position: 'absolute', inset: 0, minHeight: 0, color: '#fff' }}>
              <div className="stack" style={{ justifyItems: 'center' }}>
                <h2 style={{ fontSize: 34, fontWeight: 900 }}>{state === 'over' ? (es ? '¡Chocaste!' : 'Game over!') : 'Snake'}</h2>
                {state === 'over' && <p>{score} {es ? 'puntos' : 'points'}</p>}
                <button className="btn grad" onClick={() => setState('playing')}>{state === 'over' ? (es ? 'Otra vez' : 'Play again') : es ? 'Jugar' : 'Play'}</button>
                <small style={{ opacity: 0.7 }}>{es ? 'Flechas o desliza en el celular' : 'Arrow keys or swipe on mobile'}</small>
              </div>
            </div>
          )}
        </div>
        <div className="dpad">
          <button className="up" onClick={() => turn({ x: 0, y: -1 })} aria-label="up">↑</button>
          <button className="left" onClick={() => turn({ x: -1, y: 0 })} aria-label="left">←</button>
          <button className="down" onClick={() => turn({ x: 0, y: 1 })} aria-label="down">↓</button>
          <button className="right" onClick={() => turn({ x: 1, y: 0 })} aria-label="right">→</button>
        </div>
      </div>
      {board && board.length > 0 && (
        <div className="stack" style={{ marginTop: 28 }}>
          <h3>{es ? 'Top 10 de Snake' : 'Snake top 10'}</h3>
          <div className="rank-list">
            {board.map((r, i) => (
              <div className={'rank-row' + (r.id === user?.uid ? ' me' : '')} key={r.id}>
                <span className="pos">{i + 1}</span>
                <Avatar name={r.name} photo={r.photo} />
                <div className="nm">{r.name}</div>
                <div className="sc">{r.best}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function spawn(snake: P[]): P {
  while (true) {
    const p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p
  }
}
