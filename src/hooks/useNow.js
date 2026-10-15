import { useEffect, useState } from 'react'

// 「今の時刻」を返すフック。開いたままでも1分ごとに更新されるので、
// 日付が変わったり、締切を過ぎたりしたときに画面が自動で切り替わる
export function useNow(intervalMs = 60 * 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
