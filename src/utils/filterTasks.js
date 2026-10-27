// 状態で絞り込むときの選択肢
export const STATUS_OPTIONS = [
  { value: 'todo', label: '未完了' },
  { value: 'done', label: '完了' },
  { value: 'missed', label: '未達成' },
  { value: 'all', label: 'すべて' },
]

// 絞り込みの初期値（「条件をリセット」でもこの値に戻す）
export const DEFAULT_CONDITIONS = {
  keyword: '',
  status: 'todo',
  subject: '', // 空文字 ＝ すべての科目
  sort: 'dueAsc',
}

// 検索・絞り込みの条件に合う課題だけを返す
export function filterTasks(tasks, { keyword, status, subject }) {
  // 大文字・小文字を区別せずに探す
  const word = keyword.trim().toLowerCase()

  return tasks.filter((task) => {
    if (status === 'todo' && (task.done || task.missed)) return false
    if (status === 'done' && !task.done) return false
    if (status === 'missed' && !task.missed) return false
    if (subject && task.subject !== subject) return false
    if (word) {
      const text = `${task.subject} ${task.title}`.toLowerCase()
      if (!text.includes(word)) return false
    }
    return true
  })
}
