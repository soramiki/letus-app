import { formatDateTime, getDueStatus } from '../utils/date.js'
import { getMissedLevel } from '../utils/missedStats.js'
import { getStartAt } from '../utils/startAt.js'

const DUE_LABELS = {
  overdue: '期限切れ',
  today: '今日まで',
  missed: '未達成',
}

// 課題1件分の表示
// onResult：渡されたときだけ、期限切れの課題に「提出できた／できなかった」のボタンを出す（ホーム用）
// missedCount：この科目の未達成の回数。1回以上なら注意を出す（ホーム用）
// subjectColor：科目の色（タイムラインと同じ色）。左の線と、科目名の前の丸に使う
export function TaskItem({ task, now, subjectColor, missedCount = 0, onToggleDone, onEdit, onResult }) {
  const status = task.done ? 'done' : task.missed ? 'missed' : getDueStatus(task.dueAt, now)
  // 始める日時は、まだ締切前の未完了の課題にだけ出す
  const startAt = status === 'today' || status === 'later' ? getStartAt(task, now) : null
  const showResultButtons = onResult && status === 'overdue'

  return (
    <li
      className={`task-item task-item--${status}`}
      style={subjectColor ? { '--subject-color': subjectColor } : undefined}
    >
      <div className="task-item__main">
        <input
          type="checkbox"
          className="task-item__check"
          checked={task.done}
          onChange={() => onToggleDone(task.id)}
          aria-label={`${task.title}を完了にする`}
        />
        <button type="button" className="task-item__body" onClick={() => onEdit(task)}>
          <span className="task-item__subject">
            {subjectColor && <span className="tl-dot" aria-hidden="true" />}
            {task.subject}
          </span>
          <span className="task-item__title">{task.title}</span>
          <span className="task-item__due">
            {task.dueAt ? `締切 ${formatDateTime(task.dueAt)}` : '締切未定'}
            {DUE_LABELS[status] && <span className="task-item__badge">{DUE_LABELS[status]}</span>}
          </span>
          {startAt && (
            <span className={`task-item__start ${startAt.isNow ? 'task-item__start--now' : ''}`}>
              {startAt.isNow ? '今すぐ始める' : `始める ${formatDateTime(startAt.at)}`}
            </span>
          )}
          {missedCount > 0 && (
            <span className={`task-item__warning task-item__warning--${getMissedLevel(missedCount)}`}>
              ⚠ この科目は、これまでに{missedCount}回提出できていません
            </span>
          )}
        </button>
      </div>

      {showResultButtons && (
        <div className="task-item__result">
          <button type="button" className="button button--primary" onClick={() => onResult(task.id, 'done')}>
            提出できた
          </button>
          <button type="button" className="button button--danger" onClick={() => onResult(task.id, 'missed')}>
            できなかった
          </button>
        </div>
      )}

      {/* 未達成にした課題は、一覧から取り消せる（押し間違えたとき用） */}
      {status === 'missed' && onResult && (
        <div className="task-item__result">
          <button type="button" className="link-button" onClick={() => onResult(task.id, 'open')}>
            「未達成」を取り消す
          </button>
        </div>
      )}
    </li>
  )
}
