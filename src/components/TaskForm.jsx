import { useEffect, useState } from 'react'

// 追加・編集のモーダル（画面の上に重ねて出す小窓）
// task が null なら「追加」、課題が渡されたら「編集」
export function TaskForm({ task, subjects, onSave, onDelete, onClose }) {
  const isEdit = task !== null

  // 入力欄の中身。編集のときは、その課題の値から始める
  const [subject, setSubject] = useState(task?.subject ?? '')
  const [title, setTitle] = useState(task?.title ?? '')
  const [dueAt, setDueAt] = useState(task?.dueAt ?? '')
  const [startAt, setStartAt] = useState(task?.startAt ?? '')
  // 開始日時の欄は、すでに値があるときだけ最初から開いておく（クイック追加をシンプルに保つ）
  const [showStart, setShowStart] = useState(Boolean(task?.startAt))
  const [error, setError] = useState('')

  // Escキーで閉じる
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault() // ページの再読み込みを止める（フォームの標準の動き）
    if (startAt && dueAt && startAt > dueAt) {
      setError('開始日時が締切より後になっています')
      return
    }
    onSave({
      subject: subject.trim(),
      title: title.trim(),
      // 空欄は null として保存する（null ＝ 未定）
      dueAt: dueAt || null,
      startAt: startAt || null,
    })
  }

  function handleDelete() {
    if (window.confirm(`「${task.title}」を削除しますか？`)) {
      onDelete(task.id)
    }
  }

  return (
    // 背景（暗い部分）をタップしたら閉じる
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-heading"
        // 小窓の中のタップは、背景まで伝わらないようにする
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="task-form-heading">{isEdit ? '課題を編集' : '課題を追加'}</h2>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span className="field__label">科目</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              list="subject-options"
              placeholder="例：微分積分"
              required
              autoFocus={!isEdit}
            />
            {/* 登録済みの科目を候補として出す */}
            <datalist id="subject-options">
              {subjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span className="field__label">課題名</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：第4回演習問題"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">
              締切 <small>（空欄なら締切未定）</small>
            </span>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </label>

          {showStart ? (
            <label className="field">
              <span className="field__label">
                開始 <small>（空欄なら開始日なし）</small>
              </span>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
          ) : (
            <button type="button" className="link-button" onClick={() => setShowStart(true)}>
              ＋ 開始日時も入れる
            </button>
          )}

          {error && <p className="form__error">{error}</p>}

          <div className="form__actions">
            {isEdit && (
              <button type="button" className="button button--danger" onClick={handleDelete}>
                削除
              </button>
            )}
            <button type="button" className="button" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="button button--primary">
              {isEdit ? '保存' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
