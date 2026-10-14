// 日付まわりの計算をまとめたファイル
// 日時は '2026-10-20T08:50' の形の文字列で保存している（日本時間）

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// '2026-10-20T08:50' → '10/20(火) 8:50'
export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]}) ${d.getHours()}:${minutes}`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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
