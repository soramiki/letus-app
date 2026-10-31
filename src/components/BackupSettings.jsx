import { useState } from 'react'
import {
  createBackupFile,
  loadLastBackup,
  parseBackup,
  restoreSubjectColors,
  saveFile,
  saveLastBackup,
} from '../utils/backup.js'
import { formatDateTime } from '../utils/date.js'

// 設定の中の「バックアップ」：課題と科目の色をファイルに保存する／ファイルから戻す
export function BackupSettings({ tasks, onRestore }) {
  const [lastBackup, setLastBackup] = useState(loadLastBackup)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSave() {
    setMessage('')
    setError('')
    const { file } = createBackupFile(tasks)
    const saved = await saveFile(file)
    if (!saved) return
    saveLastBackup()
    setLastBackup(new Date().toISOString())
    setMessage(`バックアップを保存しました（課題 ${tasks.length}件）。`)
  }

  async function handleRestoreFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // 同じファイルをもう一度選んでも反応するように、選択を空に戻す
    if (!file) return
    setMessage('')
    setError('')
    try {
      const backup = parseBackup(await file.text())
      const when = backup.exportedAt ? `${formatDateTime(backup.exportedAt)}に保存した` : ''
      const ok = window.confirm(
        `今の課題（${tasks.length}件）を、${when}バックアップの課題（${backup.tasks.length}件）に置き換えます。よろしいですか？`,
      )
      if (!ok) return
      restoreSubjectColors(backup.subjectColors)
      onRestore(backup.tasks)
      setMessage(`バックアップから戻しました（課題 ${backup.tasks.length}件）。`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="settings-section" aria-labelledby="backup-heading">
      <h3 id="backup-heading" className="settings-section__heading">
        バックアップ
      </h3>
      <p className="page-note">
        課題はこの端末の中にしかないので、機種変更やブラウザのデータを消したときのために、ときどき保存しておきましょう。
        課題（完了・未達成の記録も）と科目の色が入ります。カレンダーURLは入りません。
      </p>
      <p className="notice-status">
        前回の保存：{lastBackup ? formatDateTime(lastBackup) : 'まだ保存していません'}
      </p>

      {message && <p className="import-message">{message}</p>}
      {error && <p className="form__error">{error}</p>}

      <div className="settings-section__actions">
        <button type="button" className="button button--primary" onClick={handleSave}>
          バックアップを保存
        </button>
        {/* ファイルを選ぶ欄は見た目を整えにくいので、label をボタンのように見せる */}
        <label className="button file-button">
          バックアップから戻す
          <input type="file" accept=".json,application/json" onChange={handleRestoreFile} />
        </label>
      </div>
      <p className="page-note">iPhoneは「バックアップを保存」のあと、「"ファイル"に保存」を選んでください。</p>
    </section>
  )
}
