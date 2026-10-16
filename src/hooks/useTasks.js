import { useEffect, useState } from 'react'
import { createId } from '../utils/id.js'
import { importEvents } from '../utils/importEvents.js'
import { createSampleTasks, isSampleTask } from '../utils/sampleTasks.js'

// LocalStorage（ブラウザの中の保存場所）に保存するときの名前
const STORAGE_KEY = 'letus-app.tasks'

// 保存してある課題を読み込む。なければ空の配列
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    // 保存データが壊れていても、アプリが止まらないようにする
    return []
  }
}

// 課題の一覧と、それを変更する関数をまとめたカスタムフック
// （カスタムフック＝useState などを組み合わせて、使い回せる形にしたもの）
export function useTasks() {
  // 最初の1回だけ loadTasks を呼んで、保存データから始める
  const [tasks, setTasks] = useState(loadTasks)

  // tasks が変わるたびに、LocalStorage に書き込む
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  // fields: { subject, title, startAt, dueAt }
  function addTask(fields) {
    const task = { id: createId(), done: false, letusUids: [], ...fields }
    setTasks((prev) => [...prev, task])
  }

  function updateTask(id, fields) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...fields } : task)))
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  function toggleDone(id) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  // .ics から読み込んだ予定を反映する（ルールは importEvents.js）
  // options: { markPastAsDone } 締切を過ぎた新しい課題を完了にするか
  function importLetusEvents(events, options) {
    setTasks((prev) => importEvents(prev, events, createId, options).tasks)
  }

  // サンプルの課題をまとめて入れる／まとめて消す（自分で登録した課題はそのまま）
  function addSampleTasks() {
    setTasks((prev) => [...prev.filter((task) => !isSampleTask(task)), ...createSampleTasks()])
  }

  function removeSampleTasks() {
    setTasks((prev) => prev.filter((task) => !isSampleTask(task)))
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleDone,
    importLetusEvents,
    addSampleTasks,
    removeSampleTasks,
  }
}
