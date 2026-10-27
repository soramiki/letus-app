// 「提出できなかった（未達成）」課題を、科目ごとに数える
//
// 課題の状態は3つ：
//   完了（done: true） … 提出できた
//   未達成（missed: true） … 期限を過ぎて、提出できなかった
//   どちらでもない … まだ途中（期限切れのものは、ホームで振り分けてもらう）

// 科目ごとの未達成の回数 { 科目名: 回数 }（課題の下に注意を出すときに使う）
export function getMissedCountBySubject(tasks) {
  const counts = {}
  for (const task of tasks) {
    if (task.missed) counts[task.subject] = (counts[task.subject] ?? 0) + 1
  }
  return counts
}

// 未達成が1回以上ある科目を、回数が多い順に返す
// 戻り値：[{ subject, missed: 回数 }]
export function getMissedStats(tasks) {
  return Object.entries(getMissedCountBySubject(tasks))
    .map(([subject, missed]) => ({ subject, missed }))
    .sort((a, b) => b.missed - a.missed || a.subject.localeCompare(b.subject, 'ja'))
}

// 回数に応じた注意の強さ：1回＝注意（黄）、2回＝警告（オレンジ）、3回以上＝危険（赤）
export function getMissedLevel(count) {
  if (count >= 3) return 'danger'
  if (count === 2) return 'warning'
  return 'caution'
}
