import { useEffect } from 'react'
import { assignColorIndexes, toSubjectColors } from '../utils/subjectColors.js'

// 科目ごとの色を、この端末に覚えておく（LocalStorage）
const STORAGE_KEY = 'letus-app.subjectColors'

function loadIndexes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

// 科目ごとの色 { 科目名: 色 } を返すフック
// 覚えている色をもとに、新しい科目にだけ色を割り当てる（ほかの科目の色は変えない）
export function useSubjectColors(subjects) {
  const saved = loadIndexes()
  const indexes = assignColorIndexes(saved, subjects)

  // 新しく割り当てた色があれば、覚えておく
  useEffect(() => {
    if (indexes === saved) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(indexes))
    } catch {
      // 保存できなくても、表示は計算した色で続ける
    }
  })

  return toSubjectColors(indexes)
}
