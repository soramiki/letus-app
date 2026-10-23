// テスト通知：送られてきた宛先に、今すぐ1回だけ合図を送る
import { readJsonBody, send } from './_lib/http.js'
import { isValidSubscription, sendPush } from './_lib/push.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST で送ってください' })
  try {
    const { subscription } = await readJsonBody(req)
    if (!isValidSubscription(subscription)) return send(res, 400, { error: '通知の宛先の形が正しくありません' })
    const delivered = await sendPush(subscription, { type: 'test' })
    if (!delivered) return send(res, 410, { error: '通知の宛先が使えなくなっています。通知をオンにし直してください' })
    return send(res, 200, { ok: true })
  } catch (error) {
    return send(res, 500, { error: error.message })
  }
}
