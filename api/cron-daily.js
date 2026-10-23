// 毎朝1回、登録されている全員に「今日の課題を見て」という合図を送る
// Vercel の「Cron（決まった時刻に動かす仕組み）」から呼ばれる（時刻は vercel.json）
//
// ・合図には課題の中身を入れない。件数は各端末の中で数えて通知に出す
// ・Vercel だけが呼べるように、合言葉（CRON_SECRET）を確かめる
import { send } from './_lib/http.js'
import { listSubscriptions, removeSubscription, sendPush } from './_lib/push.js'

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return send(res, 401, { error: '呼び出しが許可されていません' })
  }

  try {
    const subscriptions = await listSubscriptions()
    let sent = 0
    let removed = 0
    for (const sub of subscriptions) {
      const delivered = await sendPush(sub, { type: 'daily' }).catch(() => true)
      if (delivered) sent++
      else {
        // もう使えない宛先（通知をオフにした・アプリを消した）は片付ける
        await removeSubscription(sub.endpoint)
        removed++
      }
    }
    return send(res, 200, { sent, removed })
  } catch (error) {
    return send(res, 500, { error: error.message })
  }
}
