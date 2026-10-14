import { useCallback, useState } from 'react'
import { TaskForm } from './components/TaskForm.jsx'
import { TaskList } from './components/TaskList.jsx'
import { TaskToolbar } from './components/TaskToolbar.jsx'
import { useTasks } from './hooks/useTasks.js'
import { DEFAULT_CONDITIONS, filterTasks } from './utils/filterTasks.js'
import { sortTasks } from './utils/sortTasks.js'

function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks()

  // モーダルが開いているか、と、編集中の課題（追加のときは null）
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // 検索・絞り込み・並び替えの条件（保存はしない。開き直すと初期値に戻る）
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  // 科目の候補・絞り込み結果・並び順は保存せず、表示のたびに tasks から計算する
  const subjects = [...new Set(tasks.map((task) => task.subject))].sort((a, b) =>
    a.localeCompare(b, 'ja'),
  )
  const visibleTasks = sortTasks(filterTasks(tasks, conditions), conditions.sort)

  // 条件を1つだけ変える（ほかの条件はそのまま）
  function changeCondition(name, value) {
    setConditions((prev) => ({ ...prev, [name]: value }))
  }

  function resetConditions() {
    setConditions(DEFAULT_CONDITIONS)
  }

  function openAddForm() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function openEditForm(task) {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  // TaskForm の useEffect が毎回やり直しにならないよう、同じ関数を使い回す
  const closeForm = useCallback(() => setIsFormOpen(false), [])

  function handleSave(fields) {
    if (editingTask) {
      updateTask(editingTask.id, fields)
    } else {
      addTask(fields)
    }
    closeForm()
  }

  function handleDelete(id) {
    deleteTask(id)
    closeForm()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>課題管理</h1>
        <button type="button" className="button button--primary" onClick={openAddForm}>
          ＋ 追加
        </button>
      </header>

      <main className="app-main">
        {tasks.length > 0 && (
          <>
            <TaskToolbar conditions={conditions} subjects={subjects} onChange={changeCondition} />
            <p className="result-count">
              {visibleTasks.length}件
              {visibleTasks.length !== tasks.length && `（全${tasks.length}件中）`}
            </p>
          </>
        )}
        <TaskList
          tasks={visibleTasks}
          hasAnyTask={tasks.length > 0}
          onToggleDone={toggleDone}
          onEdit={openEditForm}
          onResetConditions={resetConditions}
        />
      </main>

      <footer className="app-footer">
        個人で作った非公式のツールです。東京理科大学およびLETUSとは関係ありません。
      </footer>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          subjects={subjects}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

export default App
