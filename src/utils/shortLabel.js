// タイムラインの印に出す、課題名の短い目印（数字1〜3文字）を作る
// 例：「第5回小テスト」→ '5'、「Unit 6 Reading Test」→ '6'、「課題4 配列の操作」→ '4'
//     数字がない「中間レポート」→ '中'（最初の1文字）

// 全角の数字（０〜９）を半角にする
function toHalfWidth(text) {
  return text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
}

export function getShortLabel(title) {
  const text = toHalfWidth(title)
  // 1. 「第〇回」があれば、その数字を優先する
  const kai = text.match(/第\s*(\d+)\s*回/)
  if (kai) return kai[1].slice(0, 3)
  // 2. それ以外は、最初に出てくる数字
  const number = text.match(/\d+/)
  if (number) return number[0].slice(0, 3)
  // 3. 数字がなければ、最初の1文字（「」などの記号は飛ばす）
  const first = text.replace(/^[\s「『(（[【]+/, '')[0]
  return first ?? '?'
}
