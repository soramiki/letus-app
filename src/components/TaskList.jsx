import { TaskItem } from './TaskItem.jsx'

// 課題の一覧。1件もないときは案内を出す
export function TaskList({ tasks, onToggleDone, onEdit }) {
  if (tasks.length === 0) {
    return (
      <p className="empty">
        まだ課題がありません。
        <br />
        右上の「＋ 追加」から登録しましょう。
      </p>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggleDone={onToggleDone} onEdit={onEdit} />
      ))}
    </ul>
  )
}
