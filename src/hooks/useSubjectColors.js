import { useEffect, useState } from 'react'
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

function saveIndexes(indexes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(indexes))
  } catch {
    // 保存できなくても、表示は計算した色で続ける
  }
}

// 科目ごとの色を扱うフック
// ・覚えている色をもとに、新しい科目にだけ色を割り当てる（ほかの科目の色は変えない）
// ・設定の画面から、科目の色を選び直せる（changeColor）
// 戻り値：{ colors: { 科目名: 色 }, colorIndexes: { 科目名: 色の番号 }, changeColor }
export function useSubjectColors(subjects) {
  // 色を選び直したときに、画面を描き直すための数（中身は使わない）
  const [, setVersion] = useState(0)

  const saved = loadIndexes()
  const indexes = assignColorIndexes(saved, subjects)

  // 新しく割り当てた色があれば、覚えておく
  useEffect(() => {
    if (indexes !== saved) saveIndexes(indexes)
  })

  function changeColor(subject, colorIndex) {
    saveIndexes({ ...indexes, [subject]: colorIndex })
    setVersion((v) => v + 1)
  }

  return { colors: toSubjectColors(indexes), colorIndexes: indexes, changeColor }
}
