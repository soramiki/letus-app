// 「LETUSの課題を取り込みましょう」のお知らせを出すかどうか
// ・前回の取り込みが今週（月曜0時以降）なら出さない
// ・今週すでに「閉じる」を押していたら出さない

import { addDays, startOfDay } from './date.js'

const LAST_IMPORT_KEY = 'letus-app.lastImport'
const DISMISSED_KEY = 'letus-app.importReminderDismissed'

// LocalStorage が使えない環境（プライベートブラウズなど）でも、アプリが止まらないようにする
function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 保存できなくても、お知らせが出続けるだけなので何もしない
  }
}

// その週の月曜日 0:00
export function startOfWeek(now) {
  const day = now.getDay() // 0:日 1:月 … 6:土
  return addDays(startOfDay(now), day === 0 ? -6 : 1 - day)
}

// 前回取り込んだ日時（ISO形式の文字列。まだなら null）
export function loadLastImport() {
  return read(LAST_IMPORT_KEY)
}

export function saveLastImport(isoString) {
  write(LAST_IMPORT_KEY, isoString)
}

// 「閉じる」を押した週の月曜日（ISO形式の文字列。なければ null）
export function loadDismissedWeek() {
  return read(DISMISSED_KEY)
}

export function saveDismissedWeek(isoString) {
  write(DISMISSED_KEY, isoString)
}

export function shouldRemind(lastImport, dismissedWeek, now) {
  const weekStart = startOfWeek(now)
  if (lastImport && new Date(lastImport) >= weekStart) return false
  if (dismissedWeek === weekStart.toISOString()) return false
  return true
}
