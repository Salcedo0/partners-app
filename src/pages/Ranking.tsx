import { useAuth } from '../auth'
import { committeeName } from '../content'
import { useRanking } from '../hooks'
import { useI18n } from '../i18n'
import { Avatar, Gate } from '../ui'

export default function Ranking() {
  return (
    <Gate>
      <RankingInner />
    </Gate>
  )
}

function RankingInner() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const rows = useRanking(true)

  if (!rows) return <div className="center faint">{t('common.loading')}</div>
  const podium = [rows[1], rows[0], rows[2]]
  const colors = ['var(--sky)', 'var(--blue)', 'var(--salmon)']
  const heights = [96, 130, 76]

  return (
    <div className="narrow page">
      <div className="page-head">
        <span className="kicker">Partners Campus</span>
        <h1>{t('ranking.title')}</h1>
        <p className="muted">{t('ranking.sub')}</p>
      </div>
      {rows.length === 0 ? (
        <p className="faint">{t('ranking.empty')}</p>
      ) : (
        <>
          <div className="podium">
            {podium.map((m, i) =>
              m ? (
                <div className="podium-col" key={m.id}>
                  <Avatar name={m.name} photo={m.photo} />
                  <span className="name">{m.name.split(' ').slice(0, 2).join(' ')}</span>
                  <div className="block" style={{ background: colors[i], height: heights[i] }}>
                    <b>{[2, 1, 3][i]}</b>
                    <small>{m.points} {t('common.pts')}{m.bonus ? ` · +${m.bonus}` : ''}</small>
                  </div>
                </div>
              ) : (
                <div key={i} />
              ),
            )}
          </div>
          <div className="rank-list">
            {rows.map((m, i) => (
              <div className={'rank-row' + (m.id === user?.uid ? ' me' : '')} key={m.id}>
                <span className="pos">{i + 1}</span>
                <Avatar name={m.name} photo={m.photo} />
                <div className="nm">
                  {m.name} {m.id === user?.uid && <span className="chip">{t('ranking.you')}</span>}
                  <small>{committeeName(m.committee, lang)}</small>
                </div>
                <div className="sc">
                  {m.points}
                  {m.bonus > 0 && <small>+{m.bonus} bonus</small>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
