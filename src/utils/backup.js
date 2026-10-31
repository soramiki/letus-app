// バックアップ：課題と科目の色を1つのファイル（JSON）にまとめる／ファイルから戻す
// ・カレンダーURLは入れない（パスワードと同じなので、ファイルが人の目に触れても困らないように）

import { toDateTimeValue } from './date.js'

const APP_ID = 'kadai-kanri' // このアプリのバックアップだと見分けるための印
const VERSION = 1
const LAST_BACKUP_KEY = 'letus-app.lastBackup'
const SUBJECT_COLORS_KEY = 'letus-app.subjectColors'

function loadSubjectColors() {
  try {
    return JSON.parse(localStorage.getItem(SUBJECT_COLORS_KEY)) ?? {}
  } catch {
    return {}
  }
}

// バックアップのファイルを作る → { file: File, fileName }
export function createBackupFile(tasks, now = new Date()) {
  const data = {
    app: APP_ID,
    version: VERSION,
    exportedAt: now.toISOString(),
    tasks,
    subjectColors: loadSubjectColors(),
  }
  // ファイル名に日付を入れて、いつのバックアップか分かるようにする（例：kadai-backup-2026-11-01.json）
  const fileName = `kadai-backup-${toDateTimeValue(now).slice(0, 10)}.json`
  const file = new File([JSON.stringify(data, null, 2)], fileName, { type: 'application/json' })
  return { file, fileName }
}

// バックアップのファイルの中身を確かめる。おかしければ、分かりやすいメッセージで Error を投げる
// 戻り値：{ tasks, subjectColors, exportedAt }
export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('ファイルを読めませんでした。このアプリで保存したバックアップを選んでください。')
  }
  if (data?.app !== APP_ID || !Array.isArray(data.tasks)) {
    throw new Error('このアプリのバックアップではないようです。')
  }
  const isTask = (t) => t && typeof t.id === 'string' && typeof t.subject === 'string' && typeof t.title === 'string'
  if (!data.tasks.every(isTask)) {
    throw new Error('バックアップの中身が壊れているようです。')
  }
  return {
    tasks: data.tasks,
    subjectColors: data.subjectColors && typeof data.subjectColors === 'object' ? data.subjectColors : {},
    exportedAt: data.exportedAt ?? null,
  }
}

// 科目の色を戻す（科目の色のしくみは LocalStorage を直接読んでいる）
export function restoreSubjectColors(subjectColors) {
  try {
    localStorage.setItem(SUBJECT_COLORS_KEY, JSON.stringify(subjectColors))
  } catch {
    // 戻せなくても、色は新しく割り当て直されるだけ
  }
}

export function loadLastBackup() {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}

export function saveLastBackup(now = new Date()) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, now.toISOString())
  } catch {
    // 記録できなくても、バックアップ自体はできている
  }
}

// ファイルを端末に保存する
// スマホは共有の画面（iPhoneは「"ファイル"に保存」を選ぶ）、PCはそのままダウンロード
// 戻り値：保存の操作まで進んだら true、共有の画面で「キャンセル」したら false
export async function saveFile(file) {
  const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent)
  if (isMobile && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch (error) {
      if (error.name === 'AbortError') return false
      // 共有できなかったときは、下のダウンロードに切り替える
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
