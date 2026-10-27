import { getMissedLevel, getMissedStats } from '../utils/missedStats.js'

const MAX_DOTS = 5 // 丸はこの数まで並べ、それ以上は数字だけで見せる

// 「提出できなかった回数」を科目ごとに見せる（ホームの下）
// 未達成が1件もなければ何も出さない
export function MissedStats({ tasks, now, subjectColors }) {
  const stats = getMissedStats(tasks, now)
  if (stats.length === 0) return null

  return (
    <section className="home-section" aria-labelledby="missed-heading">
      <h2 id="missed-heading" className="home-section__heading">
        提出できなかった回数
      </h2>
      <ul className="missed-stats">
        {stats.map((stat) => {
          const level = getMissedLevel(stat.missed)
          return (
            <li key={stat.subject} className={`missed-stats__row missed-stats__row--${level}`}>
              <span className="missed-stats__subject">
                <span className="tl-dot" style={{ background: subjectColors[stat.subject] }} />
                <span className="missed-stats__name">{stat.subject}</span>
              </span>
              <span className="missed-stats__dots" aria-hidden="true">
                {'●'.repeat(Math.min(stat.missed, MAX_DOTS))}
                {stat.missed > MAX_DOTS && '＋'}
              </span>
              <span className="missed-stats__count">{stat.missed}回</span>
              <span className="missed-stats__rate">提出率 {stat.rate}%</span>
            </li>
          )
        })}
      </ul>
      <p className="page-note">
        期限切れの課題を「できなかった」にすると数えます。提出率＝提出できた ÷（提出できた＋できなかった）。
      </p>
    </section>
  )
}
