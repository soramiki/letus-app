import { addDays, toDateTimeValue } from './date.js'

// 毎週くり返す課題を、1週ずつ別の課題として作る
// （週ごとに完了チェックや「提出できた／できなかった」を付けられるように）
//
// fields：追加画面で入れた内容 { subject, title, startAt, dueAt }（1回目の日時）
// count：何週分作るか
// startNumber：課題名に付ける「第〇回」の最初の番号（null なら付けない）
// seriesId：同じくり返しの課題をまとめて扱うための印（まとめて削除するときに使う）
export function createWeeklyTasks(fields, { count, startNumber, seriesId }) {
  const shift = (value, weeks) => (value ? toDateTimeValue(addDays(new Date(value), weeks * 7)) : null)

  return Array.from({ length: count }, (_, i) => ({
    ...fields,
    title: startNumber === null ? fields.title : `${fields.title} 第${startNumber + i}回`,
    startAt: shift(fields.startAt, i),
    dueAt: shift(fields.dueAt, i),
    seriesId,
  }))
}
