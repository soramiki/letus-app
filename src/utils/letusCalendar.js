// LETUS の「カレンダーURL」を使って、最新の .ics を受け取る
//
// カレンダーURL は、LETUS の書き出しページの「カレンダーURLを取得」で手に入る。
// ログインしなくても予定を読めるURLなので、パスワードと同じように扱う：
// ・この端末のブラウザの中（LocalStorage）にだけ保存する
// ・画面には全部は出さない

const STORAGE_KEY = 'letus-app.calendarUrl'
const API_PATH = '/api/letus-calendar'

export function loadCalendarUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveCalendarUrl(url) {
  try {
    localStorage.setItem(STORAGE_KEY, url)
  } catch {
    // 保存できない環境では、次に開いたときにもう一度入力してもらうことになる
  }
}

export function removeCalendarUrl() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 何もしない
  }
}

// LETUS のカレンダーの書き出し用URLかどうか（中継役でも同じことを確かめている）
export function isLetusCalendarUrl(value) {
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === 'https:' &&
      url.hostname === 'letus.ed.tus.ac.jp' &&
      url.pathname === '/calendar/export_execute.php'
    )
  } catch {
    return false
  }
}

// 中継役（api/letus-calendar.js）を通して、.ics の文字列を受け取る
export async function fetchLetusIcs(calendarUrl) {
  let response
  try {
    response = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: calendarUrl }),
    })
  } catch {
    throw new Error('通信できませんでした。電波の状態を確認してください')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error ?? 'LETUSから受け取れませんでした')
  }
  return response.text()
}
