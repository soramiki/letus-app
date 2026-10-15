import { useCallback, useState } from 'react'
import { HomeView } from './components/HomeView.jsx'
import { ListView } from './components/ListView.jsx'
import { TabBar } from './components/TabBar.jsx'
import { TaskForm } from './components/TaskForm.jsx'
import { useNow } from './hooks/useNow.js'
import { useTasks } from './hooks/useTasks.js'
import { DEFAULT_CONDITIONS } from './utils/filterTasks.js'
import { getSubjectColors } from './utils/subjectColors.js'

function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks()
  const now = useNow()

  // 今見ている画面（'home' または 'list'）。開いたときはホームから
  const [view, setView] = useState('home')

  // モーダルが開いているか、と、編集中の課題（追加のときは null）
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // 一覧の検索・絞り込み・並び替えの条件（ホームとの行き来では残す。開き直すと初期値に戻る）
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  // 科目の一覧と色は保存せず、表示のたびに tasks から計算する
  const subjects = [...new Set(tasks.map((task) => task.subject))].sort((a, b) =>
    a.localeCompare(b, 'ja'),
  )
  const subjectColors = getSubjectColors(subjects)

  // 条件を1つだけ変える（ほかの条件はそのまま）
  function changeCondition(name, value) {
    setConditions((prev) => ({ ...prev, [name]: value }))
  }

  function resetConditions() {
    setConditions(DEFAULT_CONDITIONS)
  }

  function changeView(nextView) {
    setView(nextView)
    window.scrollTo(0, 0)
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
        {view === 'home' ? (
          <HomeView
            tasks={tasks}
            subjects={subjects}
            subjectColors={subjectColors}
            now={now}
            onToggleDone={toggleDone}
            onEdit={openEditForm}
            onAdd={openAddForm}
          />
        ) : (
          <ListView
            tasks={tasks}
            subjects={subjects}
            conditions={conditions}
            now={now}
            onChangeCondition={changeCondition}
            onResetConditions={resetConditions}
            onToggleDone={toggleDone}
            onEdit={openEditForm}
          />
        )}
      </main>

      <footer className="app-footer">
        個人で作った非公式のツールです。東京理科大学およびLETUSとは関係ありません。
      </footer>

      <TabBar view={view} onChange={changeView} />

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
