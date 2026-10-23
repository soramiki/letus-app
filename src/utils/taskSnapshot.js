// 課題の一覧の「写し」を IndexedDB（ブラウザの中のもう1つの保存場所）に置く
//
// なぜ必要か：通知を出す処理（サービスワーカー）は、アプリの画面とは別に裏で動くので、
// LocalStorage を読めない。IndexedDB なら読めるので、ここに写しを置いておく。
// 写しはこの端末の中だけにあり、サーバーには送らない。

const DB_NAME = 'letus-app'
const STORE = 'snapshot'
const KEY = 'tasks'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveTaskSnapshot(tasks) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(tasks, KEY)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadTaskSnapshot() {
  const db = await openDb()
  const tasks = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY)
    request.onsuccess = () => resolve(request.result ?? [])
    request.onerror = () => reject(request.error)
  })
  db.close()
  return tasks
}
