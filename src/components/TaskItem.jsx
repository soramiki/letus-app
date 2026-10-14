import { formatDateTime, getDueStatus } from '../utils/date.js'

const DUE_LABELS = {
  overdue: '期限切れ',
  today: '今日まで',
}

// 課題1件分の表示
export function TaskItem({ task, onToggleDone, onEdit }) {
  const status = task.done ? 'done' : getDueStatus(task.dueAt)

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
      </button>
    </li>
  )
}
