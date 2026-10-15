import { formatDateTime, getDueStatus } from '../utils/date.js'
import { getStartAt } from '../utils/startAt.js'

const DUE_LABELS = {
  overdue: '期限切れ',
  today: '今日まで',
}

// 課題1件分の表示
export function TaskItem({ task, now, onToggleDone, onEdit }) {
  const status = task.done ? 'done' : getDueStatus(task.dueAt, now)
  // 始める日時は、まだ締切前の未完了の課題にだけ出す
  const startAt = status === 'today' || status === 'later' ? getStartAt(task, now) : null

  return (
    <li className={`task-item task-item--${status}`}>
      <input
        type="checkbox"
        className="task-item__check"
        checked={task.done}
        onChange={() => onToggleDone(task.id)}
        aria-label={`${task.title}を完了にする`}
      />
      <button type="button" className="task-item__body" onClick={() => onEdit(task)}>
        <span className="task-item__subject">{task.subject}</span>
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
      </button>
    </li>
  )
}
