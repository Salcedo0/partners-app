import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { ABOUT, COMMITTEES, EVENTS, GALLERY, MISSION, PILLARS, VISION } from '../content'
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
            <h2>{es ? 'Lo que nos mueve' : 'What drives us'}</h2>
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
            <h2>{es ? 'Siete comités, un solo equipo' : 'Seven committees, one team'}</h2>
          </div>
          <div className="committees">
            {COMMITTEES.map((c) => (
              <article key={c.id} className={'committee' + (c.id === 'gh' ? ' gh' : '')}>
                <h4>{L(c.name)}</h4>
                <p>{L(c.desc)}</p>
              </article>
            ))}
          </div>
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
