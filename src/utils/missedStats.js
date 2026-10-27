// 「提出できなかった（未達成）」課題を、科目ごとに数える
//
// 課題の状態は3つ：
//   完了（done: true） … 提出できた
//   未達成（missed: true） … 期限を過ぎて、提出できなかった
//   どちらでもない … まだ途中（期限切れのものは、ホームで振り分けてもらう）

// 締切がもう過ぎた課題について、科目ごとに「提出できた」「できなかった」を数える
// 未達成が1回以上ある科目だけを、回数が多い順に返す
// 戻り値：[{ subject, missed: 回数, achieved: 提出できた数, rate: 提出率（0〜100） }]
export function getMissedStats(tasks, now = new Date()) {
  const bySubject = new Map()

  for (const task of tasks) {
    const passed = task.dueAt && new Date(task.dueAt) < now
    if (!task.missed && !(task.done && passed)) continue

    const stat = bySubject.get(task.subject) ?? { subject: task.subject, missed: 0, achieved: 0 }
    if (task.missed) stat.missed++
    else stat.achieved++
    bySubject.set(task.subject, stat)
  }

  return [...bySubject.values()]
    .filter((stat) => stat.missed > 0)
    .map((stat) => ({
      ...stat,
      rate: Math.round((stat.achieved / (stat.achieved + stat.missed)) * 100),
    }))
    .sort((a, b) => b.missed - a.missed || a.rate - b.rate)
}

// 科目ごとの未達成の回数 { 科目名: 回数 }（課題の下に注意を出すときに使う）
export function getMissedCountBySubject(tasks) {
  const counts = {}
  for (const task of tasks) {
    if (task.missed) counts[task.subject] = (counts[task.subject] ?? 0) + 1
  }
  return counts
}

// 回数に応じた注意の強さ：1回＝注意（黄）、2回＝警告（オレンジ）、3回以上＝危険（赤）
export function getMissedLevel(count) {
  if (count >= 3) return 'danger'
  if (count === 2) return 'warning'
  return 'caution'
}
