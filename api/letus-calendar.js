// LETUS のカレンダーURLから .ics を受け取って、アプリに渡す「中継役」（Vercel のサーバーレス関数）
//
// なぜ必要か：ブラウザには「よそのサイトのデータは、そのサイトが許可しないと読めない」という
// 安全のための決まり（CORS）がある。LETUS は許可していないので、アプリから直接は読めない。
// サーバー側にはこの決まりがないので、ここで代わりに受け取って返す。
//
// 安全のために：
// ・LETUS のカレンダーの書き出し用URL以外にはつながない（何でも中継する踏み台にされないように）
// ・URL は保存も記録（ログ）もしない。URL にはパスワードのような情報（authtoken）が入っているため
// ・URL はアドレスに入れず、POST の本文で受け取る（アドレスはサーバーの記録に残りやすいため）

const ALLOWED_HOST = 'letus.ed.tus.ac.jp'
const ALLOWED_PATH = '/calendar/export_execute.php'
const TIMEOUT_MS = 15000
const MAX_BYTES = 2 * 1024 * 1024 // 2MB（普通の .ics は数十KB）

// 本文（JSON）を読む。Vercel では読み込み済みのことがあるので、両方に対応する
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.statusCode = status
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'no-store')
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

// LETUS のカレンダーの書き出し用URLかどうか
export function isLetusCalendarUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === ALLOWED_HOST && url.pathname === ALLOWED_PATH
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'POST で送ってください' })
  }

  let url
  try {
    url = (await readJsonBody(req)).url
  } catch {
    return send(res, 400, { error: '送られてきた内容を読めませんでした' })
  }

  if (typeof url !== 'string' || !isLetusCalendarUrl(url)) {
    return send(res, 400, { error: 'LETUSのカレンダーURLではありません' })
  }

  try {
    const response = await fetch(url, {
      // 別のサイトへ転送（リダイレクト）されても、ついて行かない
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const text = await response.text()

    if (text.length > MAX_BYTES) {
      return send(res, 502, { error: 'LETUSから受け取ったデータが大きすぎます' })
    }
    // URL が古い・間違っていると、LETUS はカレンダーではなくエラーのページを返す
    if (!response.ok || !text.trimStart().startsWith('BEGIN:VCALENDAR')) {
      return send(res, 502, {
        error: 'LETUSからカレンダーを受け取れませんでした。カレンダーURLが正しいか確認してください',
      })
    }

    return send(res, 200, text, 'text/calendar; charset=utf-8')
  } catch {
    return send(res, 504, { error: 'LETUSにつながりませんでした。時間をおいて試してください' })
  }
}
