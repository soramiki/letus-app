import { useCallback, useState } from 'react'
import { HomeView } from './components/HomeView.jsx'
import { ImportView } from './components/ImportView.jsx'
import { ListView } from './components/ListView.jsx'
import { TabBar } from './components/TabBar.jsx'
import { TaskForm } from './components/TaskForm.jsx'
import { TimelineView } from './components/TimelineView.jsx'
import { useNow } from './hooks/useNow.js'
import { useTasks } from './hooks/useTasks.js'
import { DEFAULT_CONDITIONS } from './utils/filterTasks.js'
import {
  loadDismissedWeek,
  loadLastImport,
  saveDismissedWeek,
  saveLastImport,
  shouldRemind,
  startOfWeek,
} from './utils/importReminder.js'
import { getSubjectColors } from './utils/subjectColors.js'

function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleDone,
    importLetusEvents,
    addSampleTasks,
    removeSampleTasks,
  } = useTasks()
  const now = useNow()

  // 今見ている画面（'home'／'list'／'timeline'／'import'）。開いたときはホームから
  const [view, setView] = useState('home')

  // モーダルが開いているか、と、編集中の課題（追加のときは null）
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // 一覧の検索・絞り込み・並び替えの条件（ホームとの行き来では残す。開き直すと初期値に戻る）
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  // 前回の取り込み日時と、お知らせを「今週は閉じる」にした週
  const [lastImport, setLastImport] = useState(loadLastImport)
  const [dismissedWeek, setDismissedWeek] = useState(loadDismissedWeek)

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

  // 取り込む。サンプルのときは「前回の取り込み」を記録しない（お知らせが消えないように）
  function handleImport(events, { isSample, markPastAsDone }) {
    importLetusEvents(events, { markPastAsDone })
    if (!isSample) {
      const at = new Date().toISOString()
      saveLastImport(at)
      setLastImport(at)
    }
  }

  function dismissReminder() {
    const week = startOfWeek(now).toISOString()
    saveDismissedWeek(week)
    setDismissedWeek(week)
  }

  const reminder = shouldRemind(lastImport, dismissedWeek, now)
    ? { lastImport, onGoImport: () => changeView('import'), onDismiss: dismissReminder }
    : null

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
    // タイムラインのページだけ、PCで横幅いっぱいまで広げる
    <div className={`app ${view === 'timeline' ? 'app--wide' : ''}`}>
      <header className="app-header">
        <h1>課題管理</h1>
        <button type="button" className="button button--primary" onClick={openAddForm}>
          ＋ 追加
        </button>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <HomeView
            tasks={tasks}
            now={now}
            onToggleDone={toggleDone}
            onEdit={openEditForm}
            onAdd={openAddForm}
            onAddSamples={addSampleTasks}
            onRemoveSamples={removeSampleTasks}
            onShowTimeline={() => changeView('timeline')}
            reminder={reminder}
          />
        )}
        {view === 'list' && (
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
        {view === 'timeline' && (
          <TimelineView
            tasks={tasks}
            subjects={subjects}
            subjectColors={subjectColors}
            now={now}
            onEdit={openEditForm}
          />
        )}
        {view === 'import' && (
          <ImportView tasks={tasks} lastImport={lastImport} now={now} onImport={handleImport} />
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
