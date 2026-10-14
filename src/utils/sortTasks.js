// 並び替えの種類（画面の選択肢にもこの順で出す）
export const SORT_OPTIONS = [
  { value: 'dueAsc', label: '締切が近い順' },
  { value: 'dueDesc', label: '締切が遠い順' },
  { value: 'subject', label: '科目順' },
]

// 締切で比べる。締切未定は、どちらの順でも最後にする
function compareDue(a, b, direction) {
  if (a.dueAt === b.dueAt) return 0
  if (!a.dueAt) return 1
  if (!b.dueAt) return -1
  // '2026-10-20T08:50' の形の文字列は、そのまま比べても日時の順になる
  return (a.dueAt < b.dueAt ? -1 : 1) * direction
}

// 表示する順番に並べ替える
// どの順でも、未完了 → 完了済み の順にする
export function sortTasks(tasks, order = 'dueAsc') {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1

    if (order === 'subject') {
      // 科目名の五十音順。同じ科目の中では締切が近い順
      const bySubject = a.subject.localeCompare(b.subject, 'ja')
      return bySubject !== 0 ? bySubject : compareDue(a, b, 1)
    }
    return compareDue(a, b, order === 'dueDesc' ? -1 : 1)
  })
}
