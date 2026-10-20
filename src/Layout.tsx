import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './auth'
import { useI18n } from './i18n'
import { Avatar, Icon } from './ui'

export default function Layout() {
  const { t, lang, setLang } = useI18n()
  const { user, member, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const links = [
    { to: '/', label: t('nav.home'), icon: Icon.home, end: true },
    { to: '/ranking', label: t('nav.ranking'), icon: Icon.trophy },
    { to: '/juegos', label: t('nav.games'), icon: Icon.game },
    { to: '/guias', label: t('nav.guides'), icon: Icon.book },
    isAdmin
      ? { to: '/admin', label: t('nav.admin'), icon: Icon.scan }
      : { to: user ? '/perfil' : '/login', label: user ? t('nav.profile') : t('nav.login'), icon: Icon.user },
  ]

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="brand">
            <img src="/logo.png" alt="" />
            <span><b>Partners</b>Campus · GH</span>
          </Link>
          <nav className="nav-links">
            {links.slice(0, 4).map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
            ))}
            {isAdmin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
          </nav>
          <div className="nav-right">
            <div className="lang" role="group" aria-label="Language">
              <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>ES</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            {user ? (
              <>
                <Link to="/perfil" aria-label={t('nav.profile')} title={t('nav.profile')}>
                  <Avatar className="avatar" name={member?.name || user.displayName || ''} photo={member?.photo} />
                </Link>
                <button className="btn ghost sm signout" onClick={logout}>{t('nav.logout')}</button>
              </>
            ) : (
              <Link className="btn grad sm" to="/login">{t('nav.login')}</Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="tabbar">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="row">
          <img src="/logo.png" alt="" style={{ height: 36 }} />
          <div>
            <b>Partners Campus EAFIT</b>
            <div className="faint" style={{ fontSize: 13 }}>Bloque 29, oficina 501 · Medellín</div>
          </div>
        </div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 18 }}>
          <span>{t('home.contact')}:</span>
          <a href="mailto:partnerscampus@eafit.edu.co">partnerscampus@eafit.edu.co</a>
          <a href="https://instagram.com/partnerscampuseafit" target="_blank" rel="noreferrer">@partnerscampuseafit</a>
        </div>
      </div>
    </footer>
  )
}
