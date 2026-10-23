import { formatDateTime } from './date.js'
import { summarizeTasks } from './summary.js'

// 毎朝の通知の文章を作る（件数の行 ＋ 課題名を最大3件）
export function buildDailyMessage(tasks, now = new Date()) {
  const { overdue, dueToday, startToday } = summarizeTasks(tasks, now)

  if (overdue.length + dueToday.length + startToday.length === 0) {
    return '今日やることはありません。先の予定をタイムラインで確認しておきましょう。'
  }

  const counts = [
    dueToday.length > 0 && `今日締切 ${dueToday.length}件`,
    startToday.length > 0 && `今日始める ${startToday.length}件`,
    overdue.length > 0 && `期限切れ ${overdue.length}件`,
  ].filter(Boolean)

  // 今日締切 → 期限切れ → 今日始める の順に、最大3件まで課題名を出す
  const lines = [...dueToday, ...overdue, ...startToday]
    .slice(0, 3)
    .map((task) => `・${task.subject} ${task.title}（${formatDateTime(task.dueAt)}）`)

  return [counts.join('・'), ...lines].join('\n')
}
