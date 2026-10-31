// 「開いたときに自動で取り込む」の設定と、今日もう確認したかの記録（LocalStorage）

import { toDateTimeValue } from './date.js'

const ENABLED_KEY = 'letus-app.autoImport' // 'off' のときだけオフ（最初はオン）
const LAST_CHECK_KEY = 'letus-app.lastAutoImport' // 最後に自動で確認した日 '2026-11-01'

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
    // 保存できなくても、開くたびに確認するだけなので何もしない
  }
}

export function isAutoImportEnabled() {
  return read(ENABLED_KEY) !== 'off'
}

export function setAutoImportEnabled(enabled) {
  write(ENABLED_KEY, enabled ? 'on' : 'off')
}

// 今日の日付 '2026-11-01'
function todayKey(now) {
  return toDateTimeValue(now).slice(0, 10)
}

// 今日はもう自動で確認したか（1日1回だけにする）
export function hasCheckedToday(now = new Date()) {
  return read(LAST_CHECK_KEY) === todayKey(now)
}

export function markCheckedToday(now = new Date()) {
  write(LAST_CHECK_KEY, todayKey(now))
}
