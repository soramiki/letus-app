import { useCallback, useState } from 'react'
import { TaskForm } from './components/TaskForm.jsx'
import { TaskList } from './components/TaskList.jsx'
import { useTasks } from './hooks/useTasks.js'
import { sortTasks } from './utils/sortTasks.js'

function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks()

  // モーダルが開いているか、と、編集中の課題（追加のときは null）
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // 並び順や科目の候補は保存せず、表示のたびに tasks から計算する
  const sortedTasks = sortTasks(tasks)
  const subjects = [...new Set(tasks.map((task) => task.subject))]

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
        <TaskList tasks={sortedTasks} onToggleDone={toggleDone} onEdit={openEditForm} />
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
