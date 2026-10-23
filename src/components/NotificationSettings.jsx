import { useEffect, useState } from 'react'
import { getPushSupport, getSubscription, sendTestPush, subscribePush, unsubscribePush } from '../utils/push.js'

// 「毎朝の通知」の設定（右上の🔔から開く小窓）
export function NotificationSettings({ onClose }) {
  const support = getPushSupport()
  // 'loading'：確認中 / 'off'：オフ / 'on'：オン / 'denied'：通知が拒否されている
  const [status, setStatus] = useState(support === 'ok' ? 'loading' : 'off')
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // 開いたときに、今オンかどうかを確かめる
  useEffect(() => {
    if (support !== 'ok') return
    getSubscription()
      .then((sub) => setStatus(sub ? 'on' : Notification.permission === 'denied' ? 'denied' : 'off'))
      .catch(() => setStatus('off'))
  }, [support])

  // Escキーで閉じる
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // ボタンを押したときの共通の流れ：処理中にする → 実行 → 結果かエラーを出す
  async function run(action, successMessage) {
    setIsBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(successMessage)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsBusy(false)
    }
  }

  const turnOn = () =>
    run(async () => {
      await subscribePush()
      setStatus('on')
    }, '通知をオンにしました。「テスト通知を送る」で届くか確かめてみてください。')

  const turnOff = () =>
    run(async () => {
      await unsubscribePush()
      setStatus('off')
    }, '通知をオフにしました。')

  const sendTest = () => run(sendTestPush, 'テスト通知を送りました。数秒〜1分ほどで届きます。')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="notification-heading">毎朝の通知</h2>
        <p className="notice-text">
          毎朝7時ごろ、「今日締切」「今日始める」「期限切れ」の件数と課題名をお知らせします。
          <small>
            ※ 無料の仕組みを使っているため、時刻は最大1時間ほどずれることがあります。課題の内容はこの端末の中で数え、サーバーには送りません。
          </small>
        </p>

        {support === 'need-install' && (
          <div className="notice-box">
            <p>iPhoneで通知を受け取るには、<strong>ホーム画面に追加したアプリ</strong>から開く必要があります。</p>
            <ol>
              <li>Safariでこのページを開き、共有ボタン →「ホーム画面に追加」</li>
              <li>ホーム画面のアイコンからアプリを開く</li>
              <li>右上の🔔から、通知をオンにする</li>
            </ol>
            <small>※ 前にホーム画面に追加したアイコンがある場合は、一度削除してから追加し直してください。</small>
          </div>
        )}

        {support === 'unsupported' && (
          <p className="notice-box">このブラウザは通知に対応していません。iPhoneのSafari（iOS 16.4以降）やChromeで開いてください。</p>
        )}

        {support === 'ok' && status === 'denied' && (
          <p className="notice-box">
            通知が「許可しない」になっています。端末やブラウザの設定で、このアプリの通知を許可してください（iPhoneは「設定」→「通知」→「課題管理」）。
          </p>
        )}

        {support === 'ok' && status === 'on' && (
          <p className="notice-status notice-status--on">通知：オン</p>
        )}
        {support === 'ok' && status === 'off' && <p className="notice-status">通知：オフ</p>}

        {message && <p className="import-message">{message}</p>}
        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          {support === 'ok' && status === 'on' && (
            <>
              <button type="button" className="button button--danger" onClick={turnOff} disabled={isBusy}>
                オフにする
              </button>
              <button type="button" className="button" onClick={sendTest} disabled={isBusy}>
                テスト通知を送る
              </button>
            </>
          )}
          {support === 'ok' && status === 'off' && (
            <button type="button" className="button button--primary" onClick={turnOn} disabled={isBusy}>
              {isBusy ? '設定しています…' : '通知をオンにする'}
            </button>
          )}
          <button type="button" className="button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
