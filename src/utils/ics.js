// LETUS から書き出したカレンダー（.ics ファイル）を読む
//
// .ics の中身（予定1件分）の例：
//   BEGIN:VEVENT
//   UID:000001@letus.ed.tus.ac.jp
//   SUMMARY:第5回演習 の受験可能期間の終了
//   DTSTART:20261009T130000Z
//   CATEGORIES:情報リテラシー演習 (0000A01)
//   END:VEVENT

// 予定の名前（SUMMARY）の3つの形と、課題名の取り出し方
const SUMMARY_PATTERNS = [
  { kind: 'due', regex: /^「(.+)」の提出期限$/ }, // 「〇〇」の提出期限 → 締切
  { kind: 'start', regex: /^(.+) の受験可能期間の開始$/ }, // 〇〇 の受験可能期間の開始 → 開始
  { kind: 'due', regex: /^(.+) の受験可能期間の終了$/ }, // 〇〇 の受験可能期間の終了 → 締切
]

// 長い行は折り返されていて、続きの行は先頭が空白またはタブ → つなげ直す
function unfoldLines(text) {
  return text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)
}

// エスケープを元に戻す：\n＝改行、\,＝カンマ、\;＝セミコロン、\\＝\ 。そのあと &amp; などを文字に戻す
function unescapeText(value) {
  return value
    .replace(/\\([nN,;\\])/g, (_, c) => (c === 'n' || c === 'N' ? '\n' : c))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
}

const pad = (n) => String(n).padStart(2, '0')

function toLocalString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 日時を、このアプリの形 '2026-10-09T22:00'（日本時間）にする
// ・20261009T130000Z … 末尾の Z は UTC（世界標準時）。日本時間は +9時間
// ・20261009T130000  … Z がなければ、そのままの時刻
// ・20261009         … 日付だけなら、その日の 23:59
function parseIcsDate(value) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, , utc] = m
  if (h === undefined) return `${y}-${mo}-${d}T23:59`
  if (!utc) return `${y}-${mo}-${d}T${h}:${mi}`
  return toLocalString(new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi)))
}

// 科目名：末尾の授業コード「 (0000A01)」を取る
function parseSubject(category) {
  return category.replace(/\s*\([^()]*\)\s*$/, '').trim()
}

// .ics の文字列 → 課題に関係する予定の一覧
// 戻り値：{ events: [{ uid, kind: 'start'|'due', subject, title, at }], skipped: 課題ではない予定の数 }
export function parseIcs(text) {
  const events = []
  let skipped = 0
  let current = null

  for (const line of unfoldLines(text)) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      const event = toEvent(current)
      if (event) events.push(event)
      else skipped++
      current = null
      continue
    }
    if (!current) continue

    // 「名前;おまけの情報:値」の形。名前と値だけ取り出す
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const name = line.slice(0, colon).split(';')[0].toUpperCase()
    current[name] = line.slice(colon + 1)
  }

  return { events, skipped }
}

// 予定1件分の項目 → 課題の予定（課題ではない予定なら null）
function toEvent(props) {
  if (!props.UID || !props.SUMMARY || !props.DTSTART) return null

  const summary = unescapeText(props.SUMMARY).trim()
  const pattern = SUMMARY_PATTERNS.find((p) => p.regex.test(summary))
  if (!pattern) return null

  const at = parseIcsDate(props.DTSTART.trim())
  if (!at) return null

  return {
    // UID は「000001@letus.ed.tus.ac.jp」の形。@ より前だけを保存する
    uid: props.UID.trim().split('@')[0],
    kind: pattern.kind,
    subject: props.CATEGORIES ? parseSubject(unescapeText(props.CATEGORIES)) : '科目なし',
    title: summary.match(pattern.regex)[1].trim(),
    at,
  }
}
