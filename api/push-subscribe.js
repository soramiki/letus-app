// 通知の宛先を登録する
import { readJsonBody, send } from './_lib/http.js'
import { isValidSubscription, saveSubscription } from './_lib/push.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST で送ってください' })
  try {
    const { subscription } = await readJsonBody(req)
    if (!isValidSubscription(subscription)) return send(res, 400, { error: '通知の宛先の形が正しくありません' })
    await saveSubscription(subscription)
    return send(res, 200, { ok: true })
  } catch (error) {
    return send(res, 500, { error: error.message })
  }
}
