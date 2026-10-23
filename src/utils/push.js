// 通知（プッシュ通知）の申し込み・取り消し・テスト

// この端末・ブラウザで通知が使えるか
// 'ok'：使える / 'need-install'：iPhoneでホーム画面に追加していない / 'unsupported'：使えない
export function getPushSupport() {
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  if (isIos && !isStandalone) return 'need-install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }
  return 'ok'
}

// 通知の申し込みに使う「公開鍵」は、文字列から数字の並びに直して渡す決まりになっている
function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error ?? '通信に失敗しました')
  }
  return response.json().catch(() => ({}))
}

// 今の申し込み（なければ null）
export async function getSubscription() {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

// 通知をオンにする：許可をもらう → 申し込む → 宛先をサーバーに登録する
export async function subscribePush() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('通知が許可されませんでした。設定アプリの「通知」から許可できます')
  }

  const response = await fetch('/api/push-public-key')
  if (!response.ok) throw new Error('通知の準備ができていません（サーバーの設定を確認してください）')
  const { publicKey } = await response.json()

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // 届いた合図は必ず通知として見せる、という約束（ブラウザの決まり）
    applicationServerKey: base64UrlToUint8Array(publicKey),
  })
  await postJson('/api/push-subscribe', { subscription })
  return subscription
}

// 通知をオフにする：サーバーから宛先を消す → 申し込みを取り消す
export async function unsubscribePush() {
  const subscription = await getSubscription()
  if (!subscription) return
  await postJson('/api/push-unsubscribe', { endpoint: subscription.endpoint }).catch(() => {})
  await subscription.unsubscribe()
}

// テスト通知：サーバーから今すぐ1回送ってもらう
export async function sendTestPush() {
  const subscription = await getSubscription()
  if (!subscription) throw new Error('通知がオンになっていません')
  await postJson('/api/push-test', { subscription })
}
