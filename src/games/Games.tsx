import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { useToast } from '../ui'
import { createRoom, type GameKind } from './rooms'

export default function Games() {
  const { t, lang } = useI18n()
  const es = lang === 'es'
  const { user, member } = useAuth()
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const host = async (g: GameKind) => {
    if (!user) return nav('/login', { state: { from: '/juegos' } })
    setBusy(true)
    try {
      nav('/sala/' + (await createRoom(g, user, member, lang)))
    } catch (e) {
      console.error(e)
      toast.show(es ? 'No se pudo crear la sala' : 'Could not create the room')
    } finally {
      setBusy(false)
    }
  }
  const join = () => {
    const c = code.trim().toUpperCase()
    if (c.length === 4) nav('/sala/' + c)
  }

  const games = [
    {
      id: 'meme' as const,
      name: 'Make it Meme',
      art: '😂',
      bg: 'linear-gradient(160deg,#fd7c5e,#cf6b5b)',
      live: true,
      text: es
        ? 'Todos reciben la misma imagen, escriben el mejor texto y votan por el meme más chistoso.'
        : 'Everyone gets the same image, writes the best caption and votes for the funniest meme.',
    },
    {
      id: 'impostor' as const,
      name: 'Impostor',
      art: '🕵️',
      bg: 'linear-gradient(160deg,#161a2b,#4e689b)',
      live: true,
      text: es
        ? 'Todos ven la misma palabra menos uno. Digan pistas por turnos y descubran al impostor.'
        : 'Everyone sees the same word except one. Give clues in turns and find the impostor.',
    },
    {
      id: 'snake' as const,
      name: 'Snake',
      art: '🐍',
      bg: 'linear-gradient(160deg,#90aed1,#4e689b)',
      live: false,
      text: es ? 'El clásico. Bate el récord del grupo y sube al top 10.' : 'The classic. Beat the group record and climb the top 10.',
    },
  ]

  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="kicker">Partners for Partners</span>
        <h1>{t('games.title')}</h1>
        <p className="muted" style={{ maxWidth: 640 }}>{t('games.sub')}</p>
      </div>

      <div className="join-box">
        <input
          className="input"
          placeholder="ABCD"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && join()}
          aria-label={t('games.code')}
        />
        <button className="btn grad" onClick={join} disabled={code.trim().length !== 4}>{t('games.join')}</button>
      </div>

      <div className="games">
        {games.map((g) => (
          <article className="game-card" key={g.id}>
            <div className="game-art" style={{ background: g.bg }}>{g.art}</div>
            <div>
              <span className="chip" style={{ justifySelf: 'start' }}>{g.live ? t('games.realtime') : t('games.solo')}</span>
              <h3>{g.name}</h3>
              <p>{g.text}</p>
              {g.live ? (
                <button className="btn ghost" style={{ justifySelf: 'start', marginTop: 6 }} disabled={busy} onClick={() => host(g.id as GameKind)}>
                  {t('games.host')}
                </button>
              ) : (
                <Link className="btn ghost" style={{ justifySelf: 'start', marginTop: 6 }} to={user ? '/juegos/snake' : '/login'}>
                  {t('games.play')}
                </Link>
              )}
            </div>
          </article>
        ))}
        <article className="game-card" style={{ opacity: 0.6 }}>
          <div className="game-art" style={{ background: 'var(--grad-soft)' }}>🎯</div>
          <div>
            <span className="chip" style={{ justifySelf: 'start' }}>{es ? 'Próximamente' : 'Coming soon'}</span>
            <h3>Trivia Partners</h3>
            <p>{es ? '¿Qué tanto conoces a Partners y a tus compañeros?' : 'How well do you know Partners and your teammates?'}</p>
          </div>
        </article>
      </div>
      {toast.node}
    </div>
  )
}
