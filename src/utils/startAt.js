import { addDays, diffDays, isSameDay } from './date.js'

// 「始める日時」を計算する（CLAUDE.md の「始める日時のルール」）
//
// | 条件                         | 始める日時       |
// | 開始と締切が同じ日           | 出さない         |
// | 開始から締切まで1日しかない  | 締切の前日18時   |
// | それ以外（開始日なしも含む） | 締切の2日前18時  |
//
// ・計算結果が開始より前 → 開始の日時にそろえる
// ・計算結果がもう過ぎている → 「今すぐ」（isNow: true）
// ・締切未定 → 出さない
//
// 戻り値：{ at: Date, isNow: boolean } または null（出さない）
export function getStartAt(task, now = new Date()) {
  if (!task.dueAt) return null

  const due = new Date(task.dueAt)
  const start = task.startAt ? new Date(task.startAt) : null

  if (start && isSameDay(start, due)) return null

  const daysBefore = start && diffDays(start, due) === 1 ? 1 : 2
  let at = addDays(due, -daysBefore)
  at.setHours(18, 0, 0, 0)

  if (start && at < start) at = start

  return { at, isNow: at <= now }
}
