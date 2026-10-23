// 通知の宛先を消す
import { readJsonBody, send } from './_lib/http.js'
import { removeSubscription } from './_lib/push.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST で送ってください' })
  try {
    const { endpoint } = await readJsonBody(req)
    if (typeof endpoint !== 'string') return send(res, 400, { error: '宛先がありません' })
    await removeSubscription(endpoint)
    return send(res, 200, { ok: true })
  } catch (error) {
    return send(res, 500, { error: error.message })
  }
}
