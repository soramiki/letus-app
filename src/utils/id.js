// 課題に付ける番号。重ならないように、時刻と乱数を組み合わせる
export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
