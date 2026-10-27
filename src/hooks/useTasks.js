import { useEffect, useState } from 'react'
import { createId } from '../utils/id.js'
import { importEvents } from '../utils/importEvents.js'
import { saveTaskSnapshot } from '../utils/taskSnapshot.js'

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
  // あわせて、通知のための写しも IndexedDB に置く（失敗しても、通知の件数が古くなるだけ）
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    saveTaskSnapshot(tasks).catch(() => {})
  }, [tasks])

  // fields: { subject, title, startAt, dueAt }
  // 毎週くり返す課題は、1週ずつ別の課題として、まとめて追加する（fields の配列を渡す）
  function addTasks(fieldsList) {
    const newTasks = fieldsList.map((fields) => ({
      id: createId(),
      done: false,
      missed: false,
      letusUids: [],
      seriesId: null,
      ...fields,
    }))
    setTasks((prev) => [...prev, ...newTasks])
  }

  function addTask(fields) {
    addTasks([fields])
  }

  function updateTask(id, fields) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...fields } : task)))
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // くり返しの課題を、この回（target）以降まとめて削除する（授業が終わったとき用）
  function deleteSeriesFrom(target) {
    setTasks((prev) =>
      prev.filter(
        (task) =>
          !(task.seriesId === target.seriesId && (task.dueAt ?? '') >= (target.dueAt ?? '')),
      ),
    )
  }

  // 完了チェックを切り替える（完了にしたら「未達成」は外す）
  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done, missed: false } : task)),
    )
  }

  // 期限切れの課題を振り分ける
  // result：'done'＝提出できた / 'missed'＝提出できなかった / 'open'＝振り分けを取り消す
  function setResult(id, result) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: result === 'done', missed: result === 'missed' } : task,
      ),
    )
  }

  // .ics から読み込んだ予定を反映する（ルールは importEvents.js）
  // options: { markPastAsDone } 締切を過ぎた新しい課題を完了にするか
  function importLetusEvents(events, options) {
    setTasks((prev) => importEvents(prev, events, createId, options).tasks)
  }

  return {
    tasks,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    deleteSeriesFrom,
    toggleDone,
    setResult,
    importLetusEvents,
  }
}
