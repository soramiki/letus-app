import { useEffect, useState } from 'react'
import { addDays, formatDate } from '../utils/date.js'

const MAX_WEEKS = 30 // くり返しは最大30週分まで（1年の授業期間より少し長いくらい）

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
  // 毎週くり返す（追加のときだけ）：何週分か・「第〇回」を付けるか・最初の番号
  const [isRepeat, setIsRepeat] = useState(false)
  const [weeks, setWeeks] = useState('8')
  const [useNumber, setUseNumber] = useState(false)
  const [startNumber, setStartNumber] = useState('1')
  const [error, setError] = useState('')

  // Escキーで閉じる
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const weekCount = Number(weeks)
  const isWeeksValid = Number.isInteger(weekCount) && weekCount >= 2 && weekCount <= MAX_WEEKS

  function handleSubmit(e) {
    e.preventDefault() // ページの再読み込みを止める（フォームの標準の動き）
    if (startAt && dueAt && startAt > dueAt) {
      setError('開始日時が締切より後になっています')
      return
    }
    if (isRepeat && !dueAt) {
      setError('毎週くり返すときは、1回目の締切を入れてください')
      return
    }
    if (isRepeat && !isWeeksValid) {
      setError(`くり返す回数は 2〜${MAX_WEEKS} の数字にしてください`)
      return
    }
    onSave(
      {
        subject: subject.trim(),
        title: title.trim(),
        // 空欄は null として保存する（null ＝ 未定）
        dueAt: dueAt || null,
        startAt: startAt || null,
      },
      isRepeat
        ? { count: weekCount, startNumber: useNumber ? Math.max(1, Number(startNumber) || 1) : null }
        : null,
    )
  }

  // 削除：くり返しの課題なら「この回だけ」か「この回以降をまとめて」を選べる
  function handleDelete(following) {
    const message = following
      ? `「${task.title}」と、それ以降の同じくり返しの課題をまとめて削除しますか？`
      : `「${task.title}」を削除しますか？`
    if (window.confirm(message)) {
      onDelete(task, { following })
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
              placeholder={isRepeat ? '例：単語テスト' : '例：第4回演習問題'}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">
              {isRepeat ? '1回目の締切' : '締切'} <small>{isRepeat ? '' : '（空欄なら締切未定）'}</small>
            </span>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </label>

          {showStart ? (
            <label className="field">
              <span className="field__label">
                {isRepeat ? '1回目の開始' : '開始'} <small>（空欄なら開始日なし）</small>
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

          {/* 毎週くり返す（追加のときだけ） */}
          {!isEdit && (
            <div className={`repeat ${isRepeat ? 'repeat--on' : ''}`}>
              <label className="repeat__toggle">
                <input
                  type="checkbox"
                  checked={isRepeat}
                  onChange={(e) => setIsRepeat(e.target.checked)}
                />
                毎週くり返す（口頭で毎週出る課題など）
              </label>

              {isRepeat && (
                <>
                  <label className="repeat__row">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="2"
                      max={MAX_WEEKS}
                      value={weeks}
                      onChange={(e) => setWeeks(e.target.value)}
                      aria-label="くり返す回数"
                    />
                    週分まとめて登録する
                  </label>

                  <label className="repeat__row">
                    <input
                      type="checkbox"
                      checked={useNumber}
                      onChange={(e) => setUseNumber(e.target.checked)}
                    />
                    課題名に「第〇回」を付ける（最初は
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      disabled={!useNumber}
                      aria-label="最初の番号"
                    />
                    回）
                  </label>

                  {/* 何が登録されるかを先に見せる */}
                  {dueAt && isWeeksValid && (
                    <p className="repeat__preview">
                      {formatDate(dueAt)} 〜 {formatDate(addDays(new Date(dueAt), (weekCount - 1) * 7))}
                      の毎週、{weekCount}件を登録します
                      {useNumber && title.trim() && (
                        <>
                          <br />
                          例：{title.trim()} 第{Math.max(1, Number(startNumber) || 1)}回
                        </>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {error && <p className="form__error">{error}</p>}

          <div className="form__actions">
            {isEdit && (
              <button type="button" className="button button--danger" onClick={() => handleDelete(false)}>
                削除
              </button>
            )}
            <button type="button" className="button" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="button button--primary">
              {isEdit ? '保存' : isRepeat && isWeeksValid ? `${weekCount}件追加` : '追加'}
            </button>
          </div>

          {/* くり返しで登録した課題は、この回以降をまとめて消せる（授業が終わったとき用） */}
          {isEdit && task.seriesId && (
            <button type="button" className="link-button repeat__delete" onClick={() => handleDelete(true)}>
              この回以降の、同じくり返しの課題をまとめて削除
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
