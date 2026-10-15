// 日付まわりの計算をまとめたファイル
// 日時は '2026-10-20T08:50' の形の文字列で保存している（日本時間）

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const DAY_MS = 24 * 60 * 60 * 1000

// '2026-10-20T08:50'（または Date）→ '10/20(火) 8:50'
export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} ${d.getHours()}:${minutes}`
}

// → '10/20(火)'
export function formatDate(value) {
  const d = new Date(value)
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`
}

export function getWeekday(date) {
  return WEEKDAYS[date.getDay()]
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// その日の 0:00
export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// days 日後（マイナスなら前）の同じ時刻
export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// a の日付から b の日付まで何日あるか（時刻は無視する）
export function diffDays(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS)
}

// a から b までの長さを「日」で返す（小数あり。タイムラインの位置計算に使う）
export function daysBetween(a, b) {
  return (b - a) / DAY_MS
}

// 締切の状態を返す
// 'none'：締切未定 / 'overdue'：期限切れ / 'today'：今日締切 / 'later'：それ以降
export function getDueStatus(dueAt, now = new Date()) {
  if (!dueAt) return 'none'
  const due = new Date(dueAt)
  if (due < now) return 'overdue'
  if (isSameDay(due, now)) return 'today'
  return 'later'
}
