import { formatDateTime } from '../utils/date.js'

const MAX_SHOWN = 5 // 課題名はこの数まで出す

// 自動で取り込んだときに、ホームの上に出すお知らせ
// result：{ added：新しく追加した課題, updated：日付などが変わった課題 }
export function AutoImportNotice({ result, onDismiss }) {
  // まだ終わっていない新しい課題（締切を過ぎて「完了」で入れたものは別に数える）
  const newOpen = result.added.filter((task) => !task.done)
  const pastDone = result.added.length - newOpen.length

  const parts = [
    newOpen.length > 0 && `新しい課題 ${newOpen.length}件`,
    result.updated.length > 0 && `日付などの更新 ${result.updated.length}件`,
  ].filter(Boolean)

  return (
    <div className="auto-import" role="status">
      <div className="auto-import__header">
        <p className="auto-import__title">
          LETUSから自動で取り込みました
          {parts.length > 0 && <small>（{parts.join('・')}）</small>}
        </p>
        <button type="button" className="button" onClick={onDismiss}>
          閉じる
        </button>
      </div>

      {newOpen.length > 0 && (
        <ul className="auto-import__list">
          {newOpen.slice(0, MAX_SHOWN).map((task) => (
            <li key={task.id}>
              <span className="auto-import__subject">{task.subject}</span> {task.title}
              <span className="auto-import__due">
                {task.dueAt ? `締切 ${formatDateTime(task.dueAt)}` : '締切未定'}
              </span>
            </li>
          ))}
          {newOpen.length > MAX_SHOWN && <li>ほか {newOpen.length - MAX_SHOWN}件（一覧で見られます）</li>}
        </ul>
      )}

      {pastDone > 0 && (
        <p className="auto-import__note">締切を過ぎていた {pastDone}件は「完了」にして取り込みました。</p>
      )}
    </div>
  )
}
