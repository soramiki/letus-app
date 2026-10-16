import { formatDate } from '../utils/date.js'

// ホームの上に出す「LETUSの課題を取り込みましょう」のお知らせ（週に1回）
export function ImportReminder({ lastImport, onGoImport, onDismiss }) {
  return (
    <div className="import-reminder" role="status">
      <p className="import-reminder__text">
        LETUSの課題を取り込みましょう
        <small>（{lastImport ? `前回：${formatDate(lastImport)}` : 'まだ取り込んでいません'}）</small>
      </p>
      <div className="import-reminder__actions">
        <button type="button" className="button button--primary" onClick={onGoImport}>
          取り込む
        </button>
        <button type="button" className="button" onClick={onDismiss}>
          今週は閉じる
        </button>
      </div>
    </div>
  )
}
