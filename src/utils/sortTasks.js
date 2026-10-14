// 表示する順番に並べ替える
// 1. 未完了 → 完了済み
// 2. 締切が近い順（締切未定は最後）
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.dueAt === b.dueAt) return 0
    if (!a.dueAt) return 1
    if (!b.dueAt) return -1
    // '2026-10-20T08:50' の形の文字列は、そのまま比べても日時の順になる
    return a.dueAt < b.dueAt ? -1 : 1
  })
}
