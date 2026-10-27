// 科目ごとの色。明るい画面でも暗い画面でも見分けやすい色を選んでいる
export const COLORS = [
  '#3b7dd8', // 青
  '#e07b28', // オレンジ
  '#3f9a5a', // 緑
  '#d64f5f', // 赤
  '#8a63c9', // 紫
  '#1f9aa3', // 青緑
  '#c28a1a', // 黄土
  '#c9579b', // ピンク
]

// 科目に色を割り当てる
// ・すでに色が決まっている科目は、そのまま（科目が増えても、ほかの科目の色は変わらない）
// ・まだ色がない科目にだけ、今いる科目の中で一番使われていない色を割り当てる
//   （同じくらいなら、リストの前の色から）
//
// saved：今まで覚えている { 科目名: 色の番号 }
// subjects：今ある科目名の一覧（五十音順）
// 戻り値：新しい { 科目名: 色の番号 }（変わらなければ saved そのもの）
export function assignColorIndexes(saved, subjects) {
  const missing = subjects.filter((subject) => saved[subject] === undefined)
  if (missing.length === 0) return saved

  const next = { ...saved }
  // 今いる科目で、それぞれの色が何回使われているか
  const usage = COLORS.map(() => 0)
  for (const subject of subjects) {
    if (next[subject] !== undefined) usage[next[subject]]++
  }

  for (const subject of missing) {
    const fewest = Math.min(...usage)
    const index = usage.indexOf(fewest)
    next[subject] = index
    usage[index]++
  }
  return next
}

// { 科目名: 色の番号 } → { 科目名: 色 }
export function toSubjectColors(indexes) {
  const colors = {}
  for (const [subject, index] of Object.entries(indexes)) {
    colors[subject] = COLORS[index % COLORS.length]
  }
  return colors
}
