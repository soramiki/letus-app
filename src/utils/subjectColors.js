// 科目ごとの色。明るい画面でも暗い画面でも見分けやすい色を選んでいる
const COLORS = [
  '#3b7dd8', // 青
  '#e07b28', // オレンジ
  '#3f9a5a', // 緑
  '#d64f5f', // 赤
  '#8a63c9', // 紫
  '#1f9aa3', // 青緑
  '#c28a1a', // 黄土
  '#c9579b', // ピンク
]

// 科目名の一覧（並び順が決まったもの）から、{ 科目名: 色 } を作る
// 科目が色の数より多いときは、最初の色に戻って使い回す
export function getSubjectColors(subjects) {
  const colors = {}
  subjects.forEach((subject, i) => {
    colors[subject] = COLORS[i % COLORS.length]
  })
  return colors
}
