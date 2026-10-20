import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'
export type Bi = { es: string; en: string }

const dict = {
  'nav.home': { es: 'Inicio', en: 'Home' },
  'nav.ranking': { es: 'Ranking', en: 'Ranking' },
  'nav.games': { es: 'Juegos', en: 'Games' },
  'nav.guides': { es: 'Guías', en: 'Guides' },
  'nav.profile': { es: 'Mi perfil', en: 'My profile' },
  'nav.admin': { es: 'Panel GH', en: 'GH panel' },
  'nav.login': { es: 'Entrar', en: 'Sign in' },
  'nav.logout': { es: 'Salir', en: 'Sign out' },

  'hero.kicker': { es: 'Partners Campus EAFIT · Gestión Humana', en: 'Partners Campus EAFIT · Human Management' },
  'hero.title': { es: 'Conectar. Servir. Cambiar vidas.', en: 'Connect. Serve. Change lives.' },
  'hero.sub': {
    es: 'El espacio de los miembros de Partners: tus puntos, el ranking del semestre, las guías de GH y juegos para romper el hielo.',
    en: 'The members’ space at Partners: your points, the semester ranking, GH guides and ice-breaker games.',
  },
  'hero.cta': { es: 'Ver mi perfil', en: 'See my profile' },
  'hero.cta2': { es: 'Ver ranking', en: 'See ranking' },

  'home.pillars': { es: 'Nuestros pilares', en: 'Our pillars' },
  'home.about': { es: 'Quiénes somos', en: 'Who we are' },
  'home.committees': { es: 'Comités', en: 'Committees' },
  'home.events': { es: 'Eventos que nos definen', en: 'Events that define us' },
  'home.how': { es: '¿Cómo funcionan los puntos?', en: 'How do points work?' },
  'home.contact': { es: 'Contacto', en: 'Contact' },
  'home.mission': { es: 'Misión', en: 'Mission' },
  'home.vision': { es: 'Visión', en: 'Vision' },

  'login.title': { es: 'Entra con tu cuenta', en: 'Sign in with your account' },
  'login.sub': {
    es: 'Usa tu correo institucional @eafit.edu.co para ver tus puntos y tu QR.',
    en: 'Use your @eafit.edu.co account to see your points and your QR.',
  },
  'login.microsoft': { es: 'Entrar con Microsoft (EAFIT)', en: 'Sign in with Microsoft (EAFIT)' },
  'login.google': { es: 'Entrar con Google', en: 'Sign in with Google' },
  'login.error': { es: 'No pudimos iniciar sesión', en: 'We couldn’t sign you in' },

  'profile.points': { es: 'Puntos', en: 'Points' },
  'profile.bonus': { es: 'Bonus de juegos', en: 'Game bonus' },
  'profile.position': { es: 'Puesto', en: 'Rank' },
  'profile.qr': { es: 'Tu QR de miembro', en: 'Your member QR' },
  'profile.qrHint': {
    es: 'Muéstraselo a alguien de GH en cada actividad para sumar puntos.',
    en: 'Show it to someone from GH at every activity to earn points.',
  },
  'profile.history': { es: 'Historial', en: 'History' },
  'profile.empty': { es: 'Aún no tienes puntos. ¡Ve a la próxima actividad!', en: 'No points yet. Join the next activity!' },
  'profile.committee': { es: 'Comité', en: 'Committee' },
  'profile.name': { es: 'Nombre', en: 'Name' },
  'profile.save': { es: 'Guardar', en: 'Save' },
  'profile.saved': { es: 'Guardado', en: 'Saved' },

  'ranking.title': { es: 'Ranking del semestre', en: 'Semester ranking' },
  'ranking.sub': {
    es: 'Ordenado por puntos de actividades. Los puntos de juegos solo desempatan.',
    en: 'Sorted by activity points. Game points only break ties.',
  },
  'ranking.you': { es: 'Tú', en: 'You' },
  'ranking.empty': { es: 'Todavía no hay miembros en el ranking.', en: 'No members in the ranking yet.' },

  'games.title': { es: 'Rompehielos', en: 'Ice breakers' },
  'games.sub': {
    es: 'Juegos para arrancar cualquier reunión. Si alguien de GH crea la sala, los ganadores suman puntos de desempate.',
    en: 'Games to kick off any meeting. When GH hosts the room, winners earn tie-breaker points.',
  },
  'games.play': { es: 'Jugar', en: 'Play' },
  'games.host': { es: 'Crear sala', en: 'Create room' },
  'games.join': { es: 'Unirme', en: 'Join' },
  'games.code': { es: 'Código de sala', en: 'Room code' },
  'games.realtime': { es: 'En vivo · cada quien en su celular', en: 'Live · everyone on their phone' },
  'games.solo': { es: 'Individual', en: 'Solo' },

  'admin.scan': { es: 'Escanear', en: 'Scan' },
  'admin.members': { es: 'Miembros', en: 'Members' },
  'admin.activities': { es: 'Actividades', en: 'Activities' },
  'admin.memes': { es: 'Memes', en: 'Memes' },
  'admin.admins': { es: 'Admins', en: 'Admins' },

  'common.loading': { es: 'Cargando…', en: 'Loading…' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm' },
  'common.delete': { es: 'Eliminar', en: 'Delete' },
  'common.back': { es: 'Volver', en: 'Back' },
  'common.pts': { es: 'pts', en: 'pts' },
  'common.needLogin': { es: 'Entra para continuar', en: 'Sign in to continue' },
} satisfies Record<string, Bi>

export type Key = keyof typeof dict

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; L: (b: Bi) => string }
const I18n = createContext<Ctx>(null!)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    /* storage blocked */
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('lang', l)
    } catch {
      /* storage blocked */
    }
  }
  const value: Ctx = { lang, setLang, t: (k) => dict[k][lang], L: (b) => b[lang] }
  return <I18n.Provider value={value}>{children}</I18n.Provider>
}

export const useI18n = () => useContext(I18n)
