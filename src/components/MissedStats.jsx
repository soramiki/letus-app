import { useEffect, useState } from 'react'
import { getMissedLevel, getMissedStats } from '../utils/missedStats.js'

const MAX_DOTS = 5 // 丸はこの数まで並べ、それ以上は数字だけで見せる

// ホームの右下の丸いボタン。押すと「提出できなかった回数」を科目ごとに見せる
// 未達成が1件もなければ、ボタンも出さない
export function MissedStatsButton({ tasks, subjectColors }) {
  const [isOpen, setIsOpen] = useState(false)
  const stats = getMissedStats(tasks)
  if (stats.length === 0) return null

  const total = stats.reduce((sum, stat) => sum + stat.missed, 0)
  // ボタンの色は、いちばん回数が多い科目に合わせる
  const level = getMissedLevel(stats[0].missed)

  return (
    <>
      <button
        type="button"
        className={`fab fab--${level}`}
        onClick={() => setIsOpen(true)}
        aria-label={`提出できなかった回数（合計${total}回）を見る`}
        title="提出できなかった回数"
      >
        <span className="fab__icon" aria-hidden="true">⚠</span>
        <span className="fab__count">{total}</span>
      </button>
      {isOpen && (
        <MissedStatsDialog stats={stats} subjectColors={subjectColors} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}

// 「提出できなかった回数」の小窓
function MissedStatsDialog({ stats, subjectColors, onClose }) {
  // Escキーで閉じる
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missed-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="missed-heading">提出できなかった回数</h2>
        <ul className="missed-stats">
          {stats.map((stat) => (
            <li
              key={stat.subject}
              className={`missed-stats__row missed-stats__row--${getMissedLevel(stat.missed)}`}
            >
              <span className="missed-stats__subject">
                <span className="tl-dot" style={{ background: subjectColors[stat.subject] }} />
                <span className="missed-stats__name">{stat.subject}</span>
              </span>
              <span className="missed-stats__dots" aria-hidden="true">
                {'●'.repeat(Math.min(stat.missed, MAX_DOTS))}
                {stat.missed > MAX_DOTS && '＋'}
              </span>
              <span className="missed-stats__count">{stat.missed}回</span>
            </li>
          ))}
        </ul>
        <p className="page-note">期限切れの課題を「できなかった」にすると数えます。</p>
        <div className="form__actions">
          <button type="button" className="button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
