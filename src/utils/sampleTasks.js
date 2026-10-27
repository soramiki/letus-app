import { addDays } from './date.js'

// 試しに使ってもらうための、架空の課題（授業名も架空）
// 今日を基準に日付を決めるので、いつ入れても「期限切れ」「今日締切」「今日始める」がそろう

// サンプルの課題は、番号（またはサンプルの .ics の UID）の先頭をこの文字にして見分ける
export const SAMPLE_ID_PREFIX = 'sample-'

export function isSampleTask(task) {
  return (
    task.id.startsWith(SAMPLE_ID_PREFIX) ||
    (task.letusUids ?? []).some((uid) => uid.startsWith(SAMPLE_ID_PREFIX))
  )
}

// 今日から days 日後の hh:mm を '2026-10-20T08:50' の形にする
function at(now, days, time) {
  const d = addDays(now, days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`
}

export function createSampleTasks(now = new Date()) {
  const list = [
    ['線形代数入門', '第3回 演習問題', null, at(now, -1, '23:59')],
    ['プログラミング演習', '課題4 配列の操作', null, at(now, 0, '23:59')],
    ['線形代数入門', '第4回 演習問題', null, at(now, 2, '08:50')],
    ['ゼミ', '発表資料の準備（口頭で指示）', null, at(now, 1, '17:00')],
    ['English Communication', 'Essay draft', at(now, -3, '09:00'), at(now, 6, '23:59')],
    ['基礎化学実験', 'レポート2', at(now, 1, '13:00'), at(now, 8, '17:00')],
    ['プログラミング演習', '小テスト（受験可能期間）', at(now, 4, '09:00'), at(now, 11, '23:59')],
    ['English Communication', '単語テストの範囲を確認', null, null],
    ['基礎化学実験', 'レポート1', null, at(now, -6, '17:00'), 'done'],
    // 過去の記録（「提出できなかった回数」を見られるように）
    ['線形代数入門', '第1回 演習問題', null, at(now, -15, '23:59'), 'missed'],
    ['線形代数入門', '第2回 演習問題', null, at(now, -8, '23:59'), 'missed'],
    ['線形代数入門', '小テスト1', null, at(now, -11, '23:59'), 'done'],
    ['プログラミング演習', '課題2 条件分岐', null, at(now, -10, '23:59'), 'missed'],
    ['プログラミング演習', '課題1 はじめてのプログラム', null, at(now, -17, '23:59'), 'done'],
    ['プログラミング演習', '課題3 くり返し', null, at(now, -3, '23:59'), 'done'],
  ]

  // 最後の項目：'done'＝提出できた / 'missed'＝提出できなかった / なし＝まだ途中
  return list.map(([subject, title, startAt, dueAt, result], i) => ({
    id: `${SAMPLE_ID_PREFIX}${i + 1}`,
    subject,
    title,
    startAt,
    dueAt,
    done: result === 'done',
    missed: result === 'missed',
    letusUids: [],
  }))
}
