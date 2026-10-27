import { filterTasks } from '../utils/filterTasks.js'
import { sortTasks } from '../utils/sortTasks.js'
import { TaskList } from './TaskList.jsx'
import { TaskToolbar } from './TaskToolbar.jsx'

// 「一覧」の画面：検索・絞り込み・並び替え ＋ 課題の一覧
export function ListView({
  tasks,
  subjects,
  conditions,
  now,
  onChangeCondition,
  onResetConditions,
  onToggleDone,
  onEdit,
  onResult,
}) {
  // 絞り込み結果と並び順は保存せず、表示のたびに計算する
  const visibleTasks = sortTasks(filterTasks(tasks, conditions), conditions.sort)

  return (
    <>
      {tasks.length > 0 && (
        <>
          <TaskToolbar conditions={conditions} subjects={subjects} onChange={onChangeCondition} />
          <p className="result-count">
            {visibleTasks.length}件
            {visibleTasks.length !== tasks.length && `（全${tasks.length}件中）`}
          </p>
        </>
      )}
      <TaskList
        tasks={visibleTasks}
        hasAnyTask={tasks.length > 0}
        now={now}
        onToggleDone={onToggleDone}
        onEdit={onEdit}
        onResult={onResult}
        onResetConditions={onResetConditions}
      />
    </>
  )
}
