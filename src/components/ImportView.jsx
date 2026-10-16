import { useState } from 'react'
import { formatDateTime } from '../utils/date.js'
import { parseIcs } from '../utils/ics.js'
import { importEvents } from '../utils/importEvents.js'
import { createSampleIcs } from '../utils/sampleIcs.js'

const LETUS_EXPORT_URL = 'https://letus.ed.tus.ac.jp/calendar/export.php'

// 「取り込み」の画面：LETUS の課題を、手で入力せずに入れる
// 1. ファイルを選ぶ → 2. 何が変わるかを確認 → 3. 取り込む
export function ImportView({ tasks, lastImport, onImport }) {
  const [preview, setPreview] = useState(null) // 確認中の内容
  const [error, setError] = useState('')
  const [message, setMessage] = useState('') // 取り込み後のお知らせ

  // .ics の中身を読んで、取り込んだら何が変わるかを計算する（まだ反映はしない）
  function prepare(text, fileName, isSample) {
    setMessage('')
    const { events, skipped } = parseIcs(text)
    if (events.length === 0) {
      setPreview(null)
      setError(
        'LETUSの課題が見つかりませんでした。LETUSから書き出した .ics ファイルか確認してください。',
      )
      return
    }
    setError('')
    let n = 0
    const result = importEvents(tasks, events, () => `preview-${n++}`)
    setPreview({ fileName, events, skipped, result, isSample })
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    e.target.value = '' // 同じファイルをもう一度選んでも反応するように、選択を空に戻す
    if (!file) return
    try {
      prepare(await file.text(), file.name, false)
    } catch {
      setPreview(null)
      setError('ファイルを読み込めませんでした。')
    }
  }

  function trySample() {
    prepare(createSampleIcs(), 'サンプル（架空の授業）', true)
  }

  // サンプルの .ics をファイルとして保存する（ファイルを選ぶ流れも試せるように）
  function downloadSample() {
    const blob = new Blob([createSampleIcs()], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  function confirmImport() {
    const { result, events, isSample } = preview
    onImport(events, { isSample })
    setMessage(
      `取り込みました（追加 ${result.added.length}件・更新 ${result.updated.length}件・変更なし ${result.unchangedCount}件）`,
    )
    setPreview(null)
  }

  return (
    <section aria-labelledby="import-heading">
      <h2 id="import-heading" className="page-heading">
        LETUSから取り込み
      </h2>
      <p className="page-note">
        前回の取り込み：
        {lastImport ? formatDateTime(lastImport) : 'まだ取り込んだことがありません'}
      </p>

      {!preview && (
        <div className="import-actions">
          {/* ファイルを選ぶ欄は見た目を整えにくいので、label をボタンのように見せる */}
          <label className="button button--primary import-file">
            .ics ファイルを選ぶ
            <input type="file" onChange={handleFileChange} />
          </label>
          <button type="button" className="button" onClick={trySample}>
            サンプル（架空）で試す
          </button>
        </div>
      )}

      {error && <p className="form__error">{error}</p>}
      {message && <p className="import-message">{message}</p>}

      {preview && (
        <ImportPreview preview={preview} onConfirm={confirmImport} onCancel={() => setPreview(null)} />
      )}

      <div className="import-help">
        <h3 className="import-help__heading">LETUSから書き出す方法</h3>

        <details className="import-help__item" open>
          <summary>iPhone</summary>
          <ol>
            <li>
              <strong>Googleアプリ</strong>で <a href={LETUS_EXPORT_URL} target="_blank" rel="noreferrer">{LETUS_EXPORT_URL}</a> を開く（ブックマークしておくと便利）
              <br />
              <small>※ SafariやChromeで開くとカレンダーに追加する画面になり、ファイルとして保存できません</small>
            </li>
            <li>「すべてのイベント」と、期間「最近および次の60日間」を選んで<strong>エクスポート</strong></li>
            <li>共有 →「<strong>"ファイル"に保存</strong>」</li>
            <li>Safariでこのアプリを開き、「.ics ファイルを選ぶ」から保存したファイルを選ぶ</li>
          </ol>
        </details>

        <details className="import-help__item">
          <summary>PC</summary>
          <ol>
            <li>
              LETUSにログインした状態で <a href={LETUS_EXPORT_URL} target="_blank" rel="noreferrer">{LETUS_EXPORT_URL}</a> を開く
              <br />
              <small>※ LETUSのメニューにはカレンダーがないので、このURLを直接開きます</small>
            </li>
            <li>「すべてのイベント」と、期間「最近および次の60日間」を選んで<strong>エクスポート</strong></li>
            <li>ダウンロードされた <code>icalexport.ics</code> を、「.ics ファイルを選ぶ」から選ぶ</li>
          </ol>
        </details>

        <details className="import-help__item">
          <summary>取り込みのルール</summary>
          <ul>
            <li>「〇〇の提出期限」と「〇〇の受験可能期間の終了」は締切、「〇〇の受験可能期間の開始」は開始日時として取り込みます。</li>
            <li>開始と終了は、科目名と課題名が同じなら1件にまとめます。</li>
            <li>前に取り込んだ課題は、科目と日付だけを新しくします（締切の延長に対応）。</li>
            <li>同じ科目名・課題名で自分が登録した課題があれば、空いている日付を埋めます。</li>
            <li>完了チェックは変えません。</li>
          </ul>
        </details>

        <p className="import-help__sample">
          LETUSを使っていない方は、「サンプル（架空）で試す」か、
          <button type="button" className="link-button" onClick={downloadSample}>
            サンプルの .ics を保存
          </button>
          して読み込んでみてください。
        </p>
      </div>
    </section>
  )
}

// 取り込む前の確認：何件追加・更新されるか
function ImportPreview({ preview, onConfirm, onCancel }) {
  const { fileName, skipped, result } = preview
  const hasChanges = result.added.length > 0 || result.updated.length > 0

  return (
    <div className="import-preview">
      <p className="import-preview__file">{fileName}</p>
      <div className="import-preview__counts">
        <span>
          追加 <strong>{result.added.length}</strong>件
        </span>
        <span>
          更新 <strong>{result.updated.length}</strong>件
        </span>
        <span>
          変更なし <strong>{result.unchangedCount}</strong>件
        </span>
      </div>
      {skipped > 0 && (
        <p className="import-preview__note">課題ではない予定 {skipped}件は取り込みません。</p>
      )}

      {hasChanges ? (
        <ul className="import-preview__list">
          {[...result.added.map((t) => ['追加', t]), ...result.updated.map((t) => ['更新', t])].map(
            ([label, task]) => (
              <li key={task.id}>
                <span className={`import-preview__tag import-preview__tag--${label === '追加' ? 'add' : 'update'}`}>
                  {label}
                </span>
                <span className="import-preview__subject">{task.subject}</span>
                {task.title}
                <span className="import-preview__due">
                  {task.dueAt ? `締切 ${formatDateTime(task.dueAt)}` : '締切未定'}
                </span>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="import-preview__note">新しい課題や変更はありません。</p>
      )}

      <div className="form__actions">
        <button type="button" className="button" onClick={onCancel}>
          やめる
        </button>
        <button type="button" className="button button--primary" onClick={onConfirm}>
          取り込む
        </button>
      </div>
    </div>
  )
}
