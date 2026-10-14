import { STATUS_OPTIONS } from '../utils/filterTasks.js'
import { SORT_OPTIONS } from '../utils/sortTasks.js'

// 一覧の上に出す、検索・絞り込み・並び替えの操作部分
// conditions：今の条件 / onChange：条件を1つ変えるときに呼ぶ
export function TaskToolbar({ conditions, subjects, onChange }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="toolbar__search"
        value={conditions.keyword}
        onChange={(e) => onChange('keyword', e.target.value)}
        placeholder="科目名・課題名で検索"
        aria-label="科目名・課題名で検索"
      />

      <div className="toolbar__row">
        {/* 状態の切り替え（押されているボタンを色で示す） */}
        <div className="segmented" role="group" aria-label="状態で絞り込み">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="segmented__button"
              aria-pressed={conditions.status === option.value}
              onClick={() => onChange('status', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          className="toolbar__select"
          value={conditions.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          aria-label="科目で絞り込み"
        >
          <option value="">すべての科目</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="toolbar__select"
          value={conditions.sort}
          onChange={(e) => onChange('sort', e.target.value)}
          aria-label="並び替え"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
