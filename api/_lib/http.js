// サーバー側の処理で共通して使う道具
// （api フォルダの中でも、名前が _ で始まるものは Vercel が公開の窓口にしない）

// 本文（JSON）を読む。Vercel では読み込み済みのことがあるので、両方に対応する
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

export function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.statusCode = status
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'no-store')
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}
