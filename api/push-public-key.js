// 通知の申し込みに使う「公開鍵」を返す（公開してよい鍵。秘密鍵は返さない）
import { send } from './_lib/http.js'
import { getPublicKey } from './_lib/push.js'

export default function handler(req, res) {
  const publicKey = getPublicKey()
  if (!publicKey) return send(res, 503, { error: '通知の準備ができていません' })
  return send(res, 200, { publicKey })
}
