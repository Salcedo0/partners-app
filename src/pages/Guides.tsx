import { useState } from 'react'
import { BIAS_QUIZ, GUIDES, TEXTS } from '../content'
import { useI18n } from '../i18n'

export default function Guides() {
  const { L, lang } = useI18n()
  const es = lang === 'es'
  const [active, setActive] = useState<(typeof GUIDES)[number]['id']>('calificadores')
  const g = GUIDES.find((x) => x.id === active)!

  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="kicker">Assessment</span>
        <h1>{es ? '¿Cuál es tu rol en la jornada?' : 'What’s your role on the day?'}</h1>
        <p className="muted" style={{ maxWidth: 760 }}>{L(TEXTS.assessment)}</p>
        <p className="muted">
          {es
            ? 'Elige tu rol en la jornada y repasa lo esencial.'
            : 'Pick your role for the day and review the essentials.'}
        </p>
      </div>

      <div className="guide-pick">
        {GUIDES.map((x) => (
          <button
            key={x.id}
            className={x.id === active ? 'on' : ''}
            style={{ ['--c' as string]: x.color }}
            onClick={() => setActive(x.id)}
          >
            <b>{L(x.name)}</b>
            <small>“{L(x.motto)}”</small>
          </button>
        ))}
      </div>

      {g.sections.map((s, i) => (
        <section className="guide-sec" key={g.id + i}>
          <h3>{L(s.title)}</h3>
          {s.body && <p className="muted" style={{ maxWidth: 760 }}>{L(s.body)}</p>}
          {s.items && (
            <div className="items">
              {s.items.map((it, j) => (
                <div className="item" key={j} style={{ borderTop: `4px solid ${g.color}` }}>
                  <b>{L(it.title)}</b>
                  <p>{L(it.text)}</p>
                </div>
              ))}
            </div>
          )}
          {(s.dont || s.do) && (
            <div className="dodont">
              {s.dont && <div className="no"><b>{es ? 'Así no' : 'Not like this'}</b>{L(s.dont)}</div>}
              {s.do && <div className="yes"><b>{es ? 'Así sí' : 'Like this'}</b>{L(s.do)}</div>}
            </div>
          )}
        </section>
      ))}

      {active === 'calificadores' && <BiasQuiz />}
    </div>
  )
}

function BiasQuiz() {
  const { L, lang } = useI18n()
  const es = lang === 'es'
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const done = i >= BIAS_QUIZ.length
  const q = BIAS_QUIZ[i]

  const pick = (evidence: boolean) => {
    if (answer !== null) return
    setAnswer(evidence)
    if (evidence === q.evidence) setScore((s) => s + 1)
  }
  const next = () => {
    setAnswer(null)
    setI((x) => x + 1)
  }

  return (
    <section className="quiz">
      <div className="spread">
        <span className="kicker">{es ? 'Ponte a prueba' : 'Test yourself'}</span>
        <span className="faint" style={{ fontSize: 13 }}>{Math.min(i + 1, BIAS_QUIZ.length)}/{BIAS_QUIZ.length}</span>
      </div>
      {done ? (
        <>
          <div className="q">
            {es ? `Acertaste ${score} de ${BIAS_QUIZ.length}.` : `You got ${score} of ${BIAS_QUIZ.length}.`}{' '}
            {score === BIAS_QUIZ.length ? '🎯' : es ? 'Repasa “Sesgo o evidencia”.' : 'Review “Bias or evidence”.'}
          </div>
          <button className="btn white" onClick={() => { setI(0); setScore(0) }}>{es ? 'Otra vez' : 'Again'}</button>
        </>
      ) : (
        <>
          <div className="q">{L(q.text)}</div>
          <div className="opts">
            <button className="btn salmon" onClick={() => pick(false)} disabled={answer !== null && answer !== false}>
              {es ? 'Sesgo' : 'Bias'}
            </button>
            <button className="btn blue" onClick={() => pick(true)} disabled={answer !== null && answer !== true}>
              {es ? 'Evidencia' : 'Evidence'}
            </button>
          </div>
          {answer !== null && (
            <div className="spread">
              <b>{answer === q.evidence ? (es ? '¡Correcto!' : 'Correct!') : es ? 'No exactamente…' : 'Not quite…'}</b>
              <button className="btn white sm" onClick={next}>{es ? 'Siguiente' : 'Next'} →</button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
