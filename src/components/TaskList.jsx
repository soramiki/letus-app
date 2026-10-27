import { TaskItem } from './TaskItem.jsx'

// 課題の一覧。表示する課題がないときは案内を出す
// hasAnyTask：課題が1件でも登録されているか（「まだない」と「条件に合わない」を分けるため）
// missedCounts：{ 科目名: 未達成の回数 }。渡されたときだけ、課題の下に注意を出す
export function TaskList({
  tasks,
  hasAnyTask,
  now,
  subjectColors,
  missedCounts,
  onToggleDone,
  onEdit,
  onResult,
  onResetConditions,
}) {
  if (!hasAnyTask) {
    return (
      <p className="empty">
        まだ課題がありません。
        <br />
        右上の「＋ 追加」から登録しましょう。
      </p>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="empty">
        <p>条件に合う課題がありません。</p>
        <button type="button" className="button" onClick={onResetConditions}>
          条件をリセット
        </button>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          now={now}
          subjectColor={subjectColors?.[task.subject]}
          missedCount={missedCounts?.[task.subject] ?? 0}
          onToggleDone={onToggleDone}
          onEdit={onEdit}
          onResult={onResult}
        />
      ))}
    </ul>
  )
}
