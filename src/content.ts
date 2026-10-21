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
      es: 'Somos el comité de voluntariado de Partners. A través de iniciativas como The Kids Project y diferentes experiencias sociales, acompañamos a niños de distintas fundaciones durante el año, compartiendo aprendizajes, experiencias y momentos que dejan huella.',
      en: 'We are Partners’ volunteering committee. Through initiatives like The Kids Project and other social experiences, we walk alongside children from different foundations all year, sharing lessons, experiences and moments that leave a mark.',
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
    title: { es: 'Acompañamiento', en: 'Support' },
    text: {
      es: 'Estamos pendientes de cada miembro para que nadie se quede atrás.',
      en: 'We look out for every member so nobody falls behind.',
    },
    color: 'var(--blue)',
  },
  {
    title: { es: 'Partners for Partners', en: 'Partners for Partners' },
    text: {
      es: 'Integraciones y rompehielos para que el grupo se conozca y se cuide.',
      en: 'Socials and ice breakers so the group gets to know and care for each other.',
    },
    color: 'var(--salmon)',
  },
  {
    title: { es: 'Feedback', en: 'Feedback' },
    text: {
      es: 'Escuchamos qué funcionó en cada evento y qué podemos mejorar.',
      en: 'We listen to what worked at each event and what we can improve.',
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

/* ---------- Texts from "Textos portal web GH" ---------- */

export const TEXTS: Record<'feedback' | 'assessment' | 'committees' | 'honorarios' | 'anuarios', Bi> = {
  feedback: {
    es: 'Un espacio para recopilar y consultar los feedbacks de eventos anteriores de forma organizada y accesible. Una herramienta para aprender de experiencias pasadas, encontrar nuevas ideas y ayudar a los próximos directores a crear eventos cada vez mejores.',
    en: 'A place to collect and browse feedback from past events in an organized, accessible way. A tool to learn from past experiences, find new ideas and help future directors build ever better events.',
  },
  assessment: {
    es: 'El Assessment es el proceso de selección en el que conocemos a quienes aspiran a convertirse en nuevos miembros de Partners. A través de diferentes bases y actividades, buscamos identificar sus habilidades, actitudes y afinidad con el grupo. Se realiza un domingo, según el calendario establecido.',
    en: 'The Assessment is the selection process where we meet those who want to become new Partners members. Through different stations and activities, we look for their skills, attitudes and fit with the group. It takes place on a Sunday, according to the set calendar.',
  },
  committees: {
    es: 'Conoce cómo funciona Partners desde cada uno de sus comités. Explora sus objetivos, descubre los eventos que hacen posible nuestra experiencia y el feedback de cada uno.',
    en: 'See how Partners works through each of its committees. Explore their goals, discover the events behind our experience and the feedback on each one.',
  },
  honorarios: {
    es: 'Los honorarios son miembros que, gracias a su trayectoria, compromiso y liderazgo, han alcanzado un reconocimiento especial dentro de Partners. Para llegar a esta categoría, se requiere un recorrido mínimo de tres años en el grupo y haber asumido cargos de liderazgo, entre otros criterios. Son personas que representan la historia, los aprendizajes y el legado de Partners.',
    en: 'Honoraries are members who, through their path, commitment and leadership, have earned special recognition within Partners. Reaching this category takes at least three years in the group and having held leadership roles, among other criteria. They embody Partners’ history, lessons and legacy.',
  },
  anuarios: {
    es: 'Los anuarios reúnen los momentos, las personas y los logros que marcaron cada año en Partners. Son una forma de celebrar nuestra identidad, recordar lo que vivimos y reconocer a quienes hicieron parte de la historia. Un recuerdo que permanece en el tiempo y al que siempre podremos volver.',
    en: 'Yearbooks gather the moments, people and achievements that marked each year at Partners. They celebrate our identity, help us remember what we lived and recognize those who were part of the story. A memory that lasts and that we can always come back to.',
  },
}

/** "Camino a ser honorario" */
export const ROADMAP: { title: Bi; text: Bi }[] = [
  {
    title: { es: 'Miembro durante mínimo 3 años', en: 'Member for at least 3 years' },
    text: { es: 'Excluyendo periodos de licencia, incluyendo los de práctica.', en: 'Excluding leave periods, including internship periods.' },
  },
  {
    title: { es: 'Cargo directivo', en: 'Leadership role' },
    text: { es: 'Junta directiva o mesa directiva de HONO.', en: 'Board of directors or HONO board.' },
  },
  {
    title: { es: 'Dirigir al menos 5 eventos', en: 'Lead at least 5 events' },
    text: { es: 'Como salidas TKP, Proyecto Especial, Premios, etc.', en: 'Such as TKP outings, Special Project, Awards, etc.' },
  },
  {
    title: { es: 'Cargo honorífico', en: 'Honorary role' },
    text: { es: 'Dirección de macroevento o Buddy Program.', en: 'Leading a macro event or the Buddy Program.' },
  },
]
