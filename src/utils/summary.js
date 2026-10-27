import { addDays, isSameDay, startOfDay } from './date.js'
import { getStartAt } from './startAt.js'
import { sortTasks } from './sortTasks.js'

// ホームの「今日の要約」に出す3つのまとまり（この順で画面に出す）
export const SUMMARY_GROUPS = [
  { key: 'overdue', label: '期限切れ' },
  { key: 'dueToday', label: '今日締切' },
  { key: 'startToday', label: '今日始める' },
]

// 未完了の課題を、3つのまとまりに分ける（1つの課題は1つのまとまりにだけ入る）
// ・期限切れ：締切がもう過ぎている
// ・今日締切：締切が今日（まだ過ぎていない）
// ・今日始める：締切は明日以降で、始める日時が今日中（もう過ぎている「今すぐ」も含む）
export function summarizeTasks(tasks, now = new Date()) {
  const endOfToday = addDays(startOfDay(now), 1)
  const groups = { overdue: [], dueToday: [], startToday: [] }

  for (const task of tasks) {
    // 完了・未達成（振り分け済み）・締切未定は数えない
    if (task.done || task.missed || !task.dueAt) continue
    const due = new Date(task.dueAt)

    if (due < now) {
      groups.overdue.push(task)
    } else if (isSameDay(due, now)) {
      groups.dueToday.push(task)
    } else {
      const startAt = getStartAt(task, now)
      if (startAt && startAt.at < endOfToday) groups.startToday.push(task)
    }
  }

  // それぞれ締切が近い順に並べる
  for (const key of Object.keys(groups)) {
    groups[key] = sortTasks(groups[key])
  }
  return groups
}
