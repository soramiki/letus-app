import { useEffect, useRef, useState } from 'react'
import { hasCheckedToday, isAutoImportEnabled, markCheckedToday } from '../utils/autoImport.js'
import { parseIcs } from '../utils/ics.js'
import { importEvents } from '../utils/importEvents.js'
import { fetchLetusIcs, loadCalendarUrl } from '../utils/letusCalendar.js'

// アプリを開いたとき（裏から戻ってきたときも）に、1日1回 LETUS から自動で取り込む
// ・カレンダーURLが設定されていて、自動取り込みがオンのときだけ
// ・締切を過ぎた新しい課題は「完了」にして取り込む（手動の取り込みと同じ）
// ・失敗したときは何も出さず、次に開いたときにもう一度試す
//
// tasks：今の課題 / importLetusEvents：取り込みを反映する関数 / onImported：取り込んだ日時を記録する関数
// 戻り値：{ result：届いた内容（なければ null）, dismiss：お知らせを閉じる }
export function useAutoImport({ tasks, importLetusEvents, onImported }) {
  const [result, setResult] = useState(null)

  // 最新の値を、下の処理からいつでも読めるようにしておく
  const latest = useRef({ tasks, importLetusEvents, onImported })
  useEffect(() => {
    latest.current = { tasks, importLetusEvents, onImported }
  })

  // 受け取っている最中に、もう一度始まらないようにする
  const isRunning = useRef(false)

  useEffect(() => {
    async function check() {
      const url = loadCalendarUrl()
      if (!url || !isAutoImportEnabled() || hasCheckedToday() || isRunning.current) return
      isRunning.current = true
      try {
        const { events } = parseIcs(await fetchLetusIcs(url))
        markCheckedToday()
        if (events.length === 0) return

        const { tasks, importLetusEvents, onImported } = latest.current
        // 何が変わるかを先に数えておく（お知らせに出すため）
        let n = 0
        const preview = importEvents(tasks, events, () => `preview-${n++}`, { markPastAsDone: true })
        importLetusEvents(events, { markPastAsDone: true })
        onImported()

        if (preview.added.length > 0 || preview.updated.length > 0) {
          setResult({ added: preview.added, updated: preview.updated })
        }
      } catch {
        // 電波がないときなど。今日の確認はしなかったことにして、次に開いたときにもう一度
      } finally {
        isRunning.current = false
      }
    }

    check()
    // ホーム画面のアプリは、閉じずに裏に回っていることが多いので、前に出てきたときも確かめる
    function handleVisible() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [])

  return { result, dismiss: () => setResult(null) }
}
