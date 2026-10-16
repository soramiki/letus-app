import { addDays } from './date.js'
import { SAMPLE_ID_PREFIX } from './sampleTasks.js'

// 試し用の .ics ファイルの中身を作る（授業名も課題名も架空）
// LETUS から書き出したファイルと同じ形にしてあるので、本物と同じ読み込み方で試せる
// 今日を基準に日付を決めるので、いつ試しても「今日締切」などがそろう

const pad = (n) => String(n).padStart(2, '0')

// 今日から days 日後の hh:mm（日本時間）→ '20261009T130000Z'（UTC）
function icsDate(now, days, hours, minutes) {
  const d = addDays(now, days)
  d.setHours(hours, minutes, 0, 0)
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  )
}

export function createSampleIcs(now = new Date()) {
  // [UIDの番号, 予定の名前, 科目（授業コードつき）, 何日後, 時, 分]
  const list = [
    [101, '「レポート課題1」の提出期限', '情報リテラシー演習 (0000A01)', 0, 23, 59],
    [102, '「レポート課題2」の提出期限', '情報リテラシー演習 (0000A01)', 7, 23, 59],
    [103, '第3回小テスト の受験可能期間の開始', '統計学入門 (0000B02)', -1, 9, 0],
    [104, '第3回小テスト の受験可能期間の終了', '統計学入門 (0000B02)', 2, 23, 59],
    [105, '第4回小テスト の受験可能期間の開始', '統計学入門 (0000B02)', 6, 9, 0],
    [106, '第4回小テスト の受験可能期間の終了', '統計学入門 (0000B02)', 9, 23, 59],
    [107, '「Unit 3 Writing\\, Part 1」の提出期限', 'English Reading &amp\\; Writing (0000C03)', 1, 8, 50],
    [108, '「Unit 4 Writing」の提出期限', 'English Reading &amp\\; Writing (0000C03)', 8, 8, 50],
    [109, '中間レポート の受験可能期間の終了', '現代社会論 (0000D04)', 4, 17, 0],
    // 課題ではない予定（取り込まれずに飛ばされることを確かめる用）
    [110, '補講のお知らせ', '現代社会論 (0000D04)', 3, 10, 30],
  ]

  const lines = [
    'BEGIN:VCALENDAR',
    'METHOD:PUBLISH',
    'PRODID:-//Sample//NONSGML Sample//EN',
    'VERSION:2.0',
  ]
  for (const [num, summary, category, days, h, m] of list) {
    const at = icsDate(now, days, h, m)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${SAMPLE_ID_PREFIX}${num}@example.invalid`,
      `SUMMARY:${summary}`,
      // 長い行の折り返し（続きの行は先頭が空白）も、本物と同じように入れておく
      'DESCRIPTION:これは動作確認用の架空の課題です。実在する授業とは関係あり',
      ' ません。\\n',
      'CLASS:PUBLIC',
      `DTSTART:${at}`,
      `DTEND:${at}`,
      `CATEGORIES:${category}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}
