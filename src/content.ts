import type { Bi } from './i18n'

export const COMMITTEES: { id: string; name: Bi; desc: Bi }[] = [
  {
    id: 'presidencia',
    name: { es: 'Presidencia', en: 'Presidency' },
    desc: {
      es: 'Vela por el bienestar de todos los miembros y representa al capítulo ante la universidad y la red Partners of the Americas.',
      en: 'Looks after every member’s well-being and represents the chapter before the university and the Partners of the Americas network.',
    },
  },
  {
    id: 'vicepresidencia',
    name: { es: 'Vicepresidencia', en: 'Vice Presidency' },
    desc: {
      es: 'Maneja las finanzas del grupo y lidera las actividades que integran a los nuevos miembros.',
      en: 'Manages the group’s finances and leads the activities that welcome new members.',
    },
  },
  {
    id: 'social',
    name: { es: 'Comité Social', en: 'Social Committee' },
    desc: {
      es: 'Voluntariado que acerca a niños y niñas al inglés y a habilidades para la vida, con actividades llenas de alegría.',
      en: 'Volunteering that brings children closer to English and life skills, through joyful activities.',
    },
  },
  {
    id: 'internacional',
    name: { es: 'Comité Internacional', en: 'International Committee' },
    desc: {
      es: 'Recibe a los estudiantes internacionales que llegan a EAFIT y los integra con el campus y con Medellín.',
      en: 'Welcomes international students arriving at EAFIT and connects them with campus and Medellín.',
    },
  },
  {
    id: 'gh',
    name: { es: 'Gestión Humana', en: 'Human Management' },
    desc: {
      es: 'Diseña los “Partners for Partners” para que el grupo se conozca, se cuide y crezca junto. Administra los puntos.',
      en: 'Designs “Partners for Partners” so the group gets to know, care for and grow with each other. Runs the points.',
    },
  },
  {
    id: 'mercadeo',
    name: { es: 'Mercadeo', en: 'Marketing' },
    desc: {
      es: 'Crea las campañas de cada evento y cuenta quiénes somos con contenido gráfico y audiovisual.',
      en: 'Creates every event campaign and tells our story through graphic and audiovisual content.',
    },
  },
  {
    id: 'rrpp',
    name: { es: 'Relaciones Públicas', en: 'Public Relations' },
    desc: {
      es: 'Consigue patrocinios y conferencistas, y es el puente directo con la red Partners of the Americas.',
      en: 'Secures sponsors and speakers, and is our direct bridge to the Partners of the Americas network.',
    },
  },
]

export const committeeName = (id: string | undefined, lang: 'es' | 'en') =>
  COMMITTEES.find((c) => c.id === id)?.name[lang] ?? '—'

export const PILLARS: { title: Bi; text: Bi; color: string }[] = [
  {
    title: { es: 'Conectar', en: 'Connect' },
    text: {
      es: 'Tejemos lazos entre estudiantes locales e internacionales y con los capítulos de Partners en todo el continente.',
      en: 'We build bonds between local and international students and with Partners chapters across the Americas.',
    },
    color: 'var(--blue)',
  },
  {
    title: { es: 'Servir', en: 'Serve' },
    text: {
      es: 'Ponemos tiempo y ganas al servicio de comunidades y fundaciones a través del voluntariado.',
      en: 'We give our time and energy to communities and foundations through volunteering.',
    },
    color: 'var(--salmon)',
  },
  {
    title: { es: 'Cambiar vidas', en: 'Change lives' },
    text: {
      es: 'Formamos líderes que dejan huella dentro y fuera de Partners.',
      en: 'We grow leaders who leave a mark inside and outside Partners.',
    },
    color: 'var(--red)',
  },
]

export const MISSION: Bi = {
  es: 'Promover la cooperación internacional a través de voluntarios activos, para el desarrollo social y económico de las comunidades de las Américas, desde la dignidad humana y el compromiso social, en educación, cultura y desarrollo social.',
  en: 'To promote international cooperation through active volunteers, for the social and economic development of communities across the Americas, grounded in human dignity and social commitment, in education, culture and social development.',
}

export const VISION: Bi = {
  es: 'Un mundo donde las comunidades y las personas se empoderan y se sostienen gracias al voluntariado y las alianzas.',
  en: 'A world where communities and people are empowered and sustained through volunteering and partnerships.',
}

export const ABOUT: Bi = {
  es: 'Somos el capítulo estudiantil de Partners of the Americas en la Universidad EAFIT desde 2013. Un grupo de estudiantes de pregrado apasionados por el voluntariado y por conocer otras culturas.',
  en: 'We are the Partners of the Americas student chapter at Universidad EAFIT since 2013 — undergraduates passionate about volunteering and other cultures.',
}

export const EVENTS: { name: string; photo: string; text: Bi }[] = [
  {
    name: 'La Noche Internacional',
    photo: '/photos/noche-escenario.jpg',
    text: {
      es: 'Nuestro evento insignia: una noche para celebrar las culturas que conviven en EAFIT.',
      en: 'Our flagship event: a night to celebrate the cultures that live together at EAFIT.',
    },
  },
  {
    name: 'Voluntarios por un día',
    photo: '/photos/tiza.jpg',
    text: {
      es: 'Abrimos las puertas para que cualquiera viva un día de voluntariado con nosotros.',
      en: 'We open the doors so anyone can spend a day volunteering with us.',
    },
  },
  {
    name: 'TKP',
    photo: '/photos/social-ninos.jpg',
    text: {
      es: 'Espacios con niños y niñas de fundaciones para aprender jugando.',
      en: 'Learning-through-play sessions with children from local foundations.',
    },
  },
  {
    name: 'Friends Without Borders',
    photo: '/photos/noche-amigos.jpg',
    text: {
      es: 'Amistades que cruzan fronteras con los estudiantes de intercambio.',
      en: 'Friendships across borders with exchange students.',
    },
  },
  {
    name: 'Día Partners',
    photo: '/photos/perritos.jpg',
    text: {
      es: 'Un día para mostrarle al campus quiénes somos (con perritos incluidos).',
      en: 'A day to show campus who we are (dogs included).',
    },
  },
]

export const GALLERY = [
  '/photos/jardin.jpg',
  '/photos/intensamente.jpg',
  '/photos/noche-staff.jpg',
  '/photos/carpa.jpg',
  '/photos/amigos.jpg',
  '/photos/social-ninos.jpg',
]

/* ---------- GH guides ---------- */

export type Guide = {
  id: 'calificadores' | 'guias' | 'lideres'
  name: Bi
  motto: Bi
  color: string
  sections: { title: Bi; body?: Bi; items?: { title: Bi; text: Bi }[]; dont?: Bi; do?: Bi }[]
}

export const GUIDES: Guide[] = [
  {
    id: 'calificadores',
    name: { es: 'Calificadores', en: 'Evaluators' },
    motto: {
      es: 'Ojos atentos, criterios claros, decisiones justas.',
      en: 'Sharp eyes, clear criteria, fair decisions.',
    },
    color: 'var(--blue)',
    sections: [
      {
        title: { es: '1 · Checklist de preparación', en: '1 · Prep checklist' },
        items: [
          {
            title: { es: 'Conoce tu base', en: 'Know your station' },
            text: {
              es: 'Identifica qué habilidades se quieren evaluar y cuál es el objetivo de la actividad.',
              en: 'Know which skills are being assessed and what the activity is for.',
            },
          },
          {
            title: { es: 'Revisa los criterios', en: 'Review the criteria' },
            text: {
              es: 'Ten clara la rúbrica antes de comenzar. Así sabrás qué significa cada nivel de desempeño.',
              en: 'Know the rubric before you start, so you know what each performance level means.',
            },
          },
          {
            title: { es: 'Prepárate para ser objetivo', en: 'Get ready to be objective' },
            text: {
              es: 'Todos deben tener la misma oportunidad de demostrar sus habilidades y ser evaluados con los mismos criterios.',
              en: 'Everyone deserves the same chance to show their skills and to be judged by the same criteria.',
            },
          },
        ],
      },
      {
        title: { es: '2 · ¿Sesgo o evidencia?', en: '2 · Bias or evidence?' },
        dont: {
          es: '“Es el mejor del grupo porque tiene mucha personalidad.” — Un participante habla mucho, se expresa con seguridad y le cae bien al calificador.',
          en: '“They’re the best in the group because they have a big personality.” — Someone talks a lot, sounds confident and the evaluator likes them.',
        },
        do: {
          es: '“Demostró iniciativa y facilitó la organización del equipo.” — Propone ideas, escucha a los demás y ayuda al equipo a organizarse.',
          en: '“Showed initiative and helped the team organize.” — Proposes ideas, listens to others and helps the team get organized.',
        },
      },
      {
        title: { es: '3 · Tres reglas de oro', en: '3 · Three golden rules' },
        items: [
          {
            title: { es: 'Observa', en: 'Observe' },
            text: {
              es: 'Presta atención a los comportamientos durante toda la actividad.',
              en: 'Watch behaviors throughout the whole activity.',
            },
          },
          {
            title: { es: 'Sé justo', en: 'Be fair' },
            text: {
              es: 'Aplica los mismos criterios a todos los participantes.',
              en: 'Apply the same criteria to every participant.',
            },
          },
          {
            title: { es: 'Sustenta', en: 'Back it up' },
            text: {
              es: 'Relaciona cada calificación con una evidencia concreta.',
              en: 'Tie every score to a concrete piece of evidence.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'guias',
    name: { es: 'Guías de grupo', en: 'Group guides' },
    motto: { es: 'Acompaña, motiva, deja huella.', en: 'Walk with them, cheer them on, leave a mark.' },
    color: 'var(--salmon)',
    sections: [
      {
        title: { es: '1 · Tu grupo es tu responsabilidad', en: '1 · Your group is on you' },
        body: {
          es: 'Tu trabajo no termina cuando recibes a los aspirantes. Acompáñalos todo el recorrido, está pendiente de sus necesidades, guíalos de una base a otra y asegúrate de que sepan qué hacer y a dónde ir.',
          en: 'Your job doesn’t end when you meet the applicants. Stay with them the whole way, watch out for their needs, guide them from station to station and make sure they know what to do and where to go.',
        },
        dont: {
          es: 'Desaparecer para hablar con amigos, dejar que el grupo se adelante solo o asumir que todos saben qué hacer.',
          en: 'Disappearing to chat with friends, letting the group go ahead alone or assuming everyone knows what to do.',
        },
        do: {
          es: 'Acompaña al grupo, verifica que todos estén presentes, confirma cuál es la siguiente base y mantente atento en las transiciones.',
          en: 'Stay with the group, check everyone is there, confirm the next station and stay alert during transitions.',
        },
      },
      {
        title: { es: '2 · ¡Que la energía no se apague!', en: '2 · Keep the energy up!' },
        items: [
          {
            title: { es: 'Motiva antes de empezar', en: 'Before: hype them up' },
            text: {
              es: '“¡Ustedes pueden con esto! Confíen en sus ideas, escúchense y disfruten el reto.”',
              en: '“You’ve got this! Trust your ideas, listen to each other and enjoy the challenge.”',
            },
          },
          {
            title: { es: 'Acompaña durante la base', en: 'During: cheer, don’t solve' },
            text: {
              es: 'Anímalos sin resolverles el reto ni interferir con el calificador o el líder. “¡Vamos, equipo! Sigan intentándolo.”',
              en: 'Cheer them on without solving it for them or stepping on the evaluator or leader. “Come on, team! Keep trying.”',
            },
          },
          {
            title: { es: 'Levanta el ánimo después', en: 'After: lift them up' },
            text: {
              es: 'Celebra el esfuerzo sin juzgar resultados. “¡Bien hecho por darla toda! Cada reto es una nueva oportunidad.”',
              en: 'Celebrate the effort, not the result. “Great job giving it everything! Every challenge is a new chance.”',
            },
          },
        ],
      },
      {
        title: { es: '3 · ¡La porra también es parte del reto!', en: '3 · The chant is part of the challenge!' },
        body: {
          es: 'La porra inicial rompe la tensión, integra a los aspirantes y arranca con toda la energía. No tiene que ser perfecta: fácil de aprender, con ritmo y que todos puedan participar. La fórmula: RITMO + RESPUESTA + EQUIPO.',
          en: 'The opening chant breaks the ice, brings applicants together and starts things with full energy. It doesn’t need to be perfect: easy to learn, rhythmic and everyone can join. The formula: RHYTHM + RESPONSE + TEAM.',
        },
      },
    ],
  },
  {
    id: 'lideres',
    name: { es: 'Líderes de base', en: 'Station leaders' },
    motto: {
      es: 'Dirige con criterio, comunica con intención, reta con propósito.',
      en: 'Lead with judgment, speak with intent, challenge with purpose.',
    },
    color: 'var(--red)',
    sections: [
      {
        title: { es: '1 · Lidera sin pasar la línea', en: '1 · Lead without crossing the line' },
        body: {
          es: 'Tu trabajo es mantener el orden, orientar al grupo y hacer cumplir las instrucciones. Sé firme y claro, pero ser líder no significa ser grosero.',
          en: 'Your job is to keep order, guide the group and enforce the instructions. Be firm and clear — being a leader doesn’t mean being rude.',
        },
        dont: {
          es: '“¡Ustedes nunca entienden! ¿Es que toca explicarles todo?”',
          en: '“You never get it! Do I have to explain everything?”',
        },
        do: {
          es: '“Chicos, necesitamos organizarnos y escuchar las instrucciones para poder continuar.”',
          en: '“Team, let’s get organized and listen to the instructions so we can keep going.”',
        },
      },
      {
        title: { es: '2 · Líder + calificador: un solo equipo', en: '2 · Leader + evaluator: one team' },
        items: [
          {
            title: { es: 'Hablen antes de comenzar', en: 'Talk before you start' },
            text: {
              es: 'Acuerden instrucciones, objetivo de la base, habilidades a observar y trabas permitidas.',
              en: 'Agree on instructions, the station’s goal, the skills to observe and allowed twists.',
            },
          },
          {
            title: { es: 'Lean lo que está pasando', en: 'Read the room' },
            text: {
              es: 'Atento a las señales del calificador: si necesita observar otra habilidad, coordinen sin alterar injustamente la dinámica.',
              en: 'Watch the evaluator’s cues: if they need to see another skill, coordinate without unfairly changing the dynamic.',
            },
          },
          {
            title: { es: 'Abre oportunidades', en: 'Open opportunities' },
            text: {
              es: 'No se trata de obligar a todos a destacar igual, sino de darles oportunidades reales de demostrar sus habilidades.',
              en: 'It’s not about forcing everyone to shine the same way, but giving them real chances to show their skills.',
            },
          },
        ],
      },
      {
        title: { es: '3 · Las trabas: reta con propósito', en: '3 · Twists: challenge with purpose' },
        items: [
          {
            title: { es: 'Quitar un recurso', en: 'Remove a resource' },
            text: {
              es: 'Retira un material y pide que continúen con lo que queda. Permite observar adaptabilidad, creatividad y resolución de problemas.',
              en: 'Take away one material and ask them to keep going. Reveals adaptability, creativity and problem solving.',
            },
          },
          {
            title: { es: 'Cambiar quién puede hablar', en: 'Change who can speak' },
            text: {
              es: 'Limita por un momento a quienes más han hablado y abre espacio a otros. Permite observar escucha, delegación e inclusión.',
              en: 'Briefly limit those who’ve spoken most and make room for others. Reveals listening, delegation and inclusion.',
            },
          },
        ],
      },
    ],
  },
]

/** Quick “bias or evidence?” quiz for the evaluators guide. */
export const BIAS_QUIZ: { text: Bi; evidence: boolean }[] = [
  {
    text: { es: '“Se nota que es líder nato, tiene mucha presencia.”', en: '“A natural-born leader, huge presence.”' },
    evidence: false,
  },
  {
    text: {
      es: '“Cuando el equipo se trabó, propuso dividir las tareas y todos aceptaron.”',
      en: '“When the team got stuck, they proposed splitting tasks and everyone agreed.”',
    },
    evidence: true,
  },
  {
    text: { es: '“Me cae súper bien, seguro trabaja bien en equipo.”', en: '“I really like them, they must be a team player.”' },
    evidence: false,
  },
  {
    text: {
      es: '“Le preguntó su opinión a la persona que no había hablado.”',
      en: '“Asked the quiet person for their opinion.”',
    },
    evidence: true,
  },
  {
    text: { es: '“Habló poco, así que no aportó.”', en: '“Barely spoke, so they didn’t contribute.”' },
    evidence: false,
  },
]
