import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ABOUT, EVENTS, GALLERY, MISSION, PILLARS, VISION } from '../content'
import { Link as RLink } from 'react-router-dom'
import { Calendar, CommitteesAccordion, FeedbackHistory, Honoraries, Roadmap } from '../gh'
import { TEXTS } from '../content'
import { useI18n } from '../i18n'
import { Footer } from '../Layout'

export default function Home() {
  const { t, L, lang } = useI18n()
  const { user } = useAuth()
  const es = lang === 'es'

  const steps = [
    {
      title: es ? 'Tu QR personal' : 'Your personal QR',
      text: es ? 'Cada miembro tiene un código único en su perfil.' : 'Every member has a unique code on their profile.',
    },
    {
      title: es ? 'GH lo escanea' : 'GH scans it',
      text: es
        ? 'En cada actividad, Gestión Humana escanea y asigna los puntos.'
        : 'At every activity, Human Management scans it and assigns points.',
    },
    {
      title: es ? 'Ranking en vivo' : 'Live ranking',
      text: es ? 'Tus puntos aparecen al instante y todos ven el ranking.' : 'Points show up instantly and everyone sees the ranking.',
    },
    {
      title: es ? 'Juegos desempatan' : 'Games break ties',
      text: es
        ? 'Ganar rompehielos da puntos extra que definen empates del podio.'
        : 'Winning ice breakers gives bonus points that settle podium ties.',
    },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="wrap">
          <div className="hero-in">
            <span className="kicker">{t('hero.kicker')}</span>
            <h1>
              {es ? (
                <>Gestión Humana: <em>el corazón de Partners.</em></>
              ) : (
                <>Human Management: <em>the heart of Partners.</em></>
              )}
            </h1>
            <p>{t('hero.sub')}</p>
            <div className="hero-cta">
              <Link className="btn grad" to={user ? '/perfil' : '/login'}>{user ? t('hero.cta') : t('nav.login')}</Link>
              <Link className="btn white" to="/ranking">{t('hero.cta2')}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{t('home.pillars')}</span>
            <h2>{es ? 'Lo que hace GH' : 'What GH does'}</h2>
          </div>
          <div className="pillars">
            {PILLARS.map((p, i) => (
              <article className="pillar" key={i} style={{ ['--c' as string]: p.color }}>
                <span className="num">0{i + 1}</span>
                <div className="stack">
                  <h3 style={{ color: p.color }}>{L(p.title)}</h3>
                  <p className="muted">{L(p.text)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="how">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="kicker">{t('home.how')}</span>
              <h2>{es ? 'Cada actividad suma' : 'Every activity counts'}</h2>
            </div>
            <div className="how-steps">
              {steps.map((s, i) => (
                <div key={i}>
                  <b>0{i + 1}</b>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{t('home.committees')}</span>
            <h2>{es ? 'Cómo funciona Partners' : 'How Partners works'}</h2>
            <p className="muted">{L(TEXTS.committees)}</p>
          </div>
          <CommitteesAccordion />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="feedback">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{es ? 'Histórico de feedbacks' : 'Feedback history'}</span>
            <h2>{es ? 'Aprender de cada evento' : 'Learning from every event'}</h2>
            <p className="muted">{L(TEXTS.feedback)}</p>
          </div>
          <FeedbackHistory />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="assessment">
        <div className="wrap">
          <div className="assess">
            <div className="stack">
              <span className="kicker">Assessment</span>
              <h2>{es ? 'Así llegan los nuevos Partners' : 'How new Partners join'}</h2>
              <p>{L(TEXTS.assessment)}</p>
              <RLink className="btn white" to="/guias" style={{ justifySelf: 'start' }}>
                {es ? 'Ver las guías del Assessment' : 'See the Assessment guides'}
              </RLink>
            </div>
            <img src="/photos/jardin.jpg" alt="" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{es ? 'Calendario Partners' : 'Partners calendar'}</span>
            <h2>{es ? '¿Qué viene?' : 'What’s coming up?'}</h2>
          </div>
          <Calendar />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="honorarios">
        <div className="wrap">
          <details className="hono-card" open>
            <summary>
              <img src="/photos/noche-amigos.jpg" alt="" loading="lazy" />
              <span className="hono-chev" aria-hidden="true">⌄</span>
            </summary>
            <div className="hono-body">
              <div className="hono-head">
                <h2>{es ? 'HONORARIOS' : 'HONORARIES'}</h2>
                <p className="muted">{L(TEXTS.honorarios)}</p>
              </div>
              <h3 className="hono-sub">{es ? 'Camino a ser honorario' : 'Path to honorary'}</h3>
              <Roadmap />
              <h3 className="hono-sub">{es ? 'Honorarios actuales' : 'Current honoraries'}</h3>
              <Honoraries />
            </div>
          </details>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{t('home.events')}</span>
            <h2>{es ? 'Nuestro calendario' : 'Our calendar'}</h2>
          </div>
          <div className="events">
            {EVENTS.map((e) => (
              <article className="event" key={e.name}>
                <img src={e.photo} alt="" loading="lazy" />
                <div>
                  <h4>{e.name}</h4>
                  <p>{L(e.text)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="anuarios">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">{es ? 'Anuarios' : 'Yearbooks'}</span>
            <h2>{es ? 'Lo que marcó cada año' : 'What defined each year'}</h2>
            <p className="muted">{L(TEXTS.anuarios)}</p>
          </div>
          <span className="chip">{es ? 'Próximamente' : 'Coming soon'}</span>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap about">
          <div>
            <span className="kicker">{t('home.about')}</span>
            <h2 style={{ margin: '10px 0 16px' }}>{es ? 'Una red que cruza fronteras' : 'A network across borders'}</h2>
            <p className="muted">{L(ABOUT)}</p>
            <div className="mv">
              <div><b>{t('home.mission')}</b><p className="muted">{L(MISSION)}</p></div>
              <div><b>{t('home.vision')}</b><p className="muted">{L(VISION)}</p></div>
            </div>
          </div>
          <div className="about-photos">
            <img src="/photos/social-ninos.jpg" alt="" loading="lazy" />
            <img src="/photos/intensamente.jpg" alt="" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="gallery">
            {GALLERY.map((g) => <img key={g} src={g} alt="" loading="lazy" />)}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
