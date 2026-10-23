// サービスワーカー：アプリの画面とは別に、裏で動く処理
// 1. アプリのファイルを保存しておき、電波がなくても開けるようにする
// 2. サーバーから合図（プッシュ）が来たら、課題を数えて通知を出す

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { buildDailyMessage } from './utils/dailyMessage.js'
import { loadTaskSnapshot } from './utils/taskSnapshot.js'

// 新しい版を公開したら、すぐ切り替える
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// 通知の文章を作る。課題のデータはこの端末の中の写しから読む（サーバーは中身を知らない）
async function buildMessage() {
  return buildDailyMessage(await loadTaskSnapshot(), new Date())
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    buildMessage().then((body) =>
      self.registration.showNotification(data.type === 'test' ? 'テスト通知：今日の課題' : '今日の課題', {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'daily-summary', // 同じ種類の通知は1つにまとめる
      }),
    ),
  )
})

// 通知をタップしたら、アプリを開く（開いていればそれを前に出す）
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const opened = windows.find((w) => 'focus' in w)
      return opened ? opened.focus() : self.clients.openWindow('/')
    }),
  )
})
