// 通知の宛先の保存と、通知の合図を送る処理
//
// ・保存するのは「宛先」（どの端末に合図を送るか）だけ。課題の内容はサーバーに来ない
// ・宛先は Upstash Redis（無料のデータベース）に保存する。自分のPCで試すときはメモリに置く
// ・合図を送るには「VAPID鍵」という鍵のペアが必要。秘密鍵はコードに書かず、Vercel の環境変数に入れる

import { Redis } from '@upstash/redis'
import webpush from 'web-push'

const STORE_KEY = 'push:subscriptions'
// 合図を送る側の連絡先（決まりで必要）。個人のメールではなく、アプリのURLにしている
const SUBJECT = 'https://task-manager-kappa-three-54.vercel.app'

// 合図を送れる相手（各ブラウザの通知サービス）。これ以外の宛先は受け付けない
const PUSH_HOSTS = [
  /^web\.push\.apple\.com$/, // iPhone・Mac の Safari
  /^fcm\.googleapis\.com$/, // Chrome・Edge（Android・PC）
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /\.notify\.windows\.com$/, // Windows
]

export function getPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? null
}

function getVapidDetails() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) throw new Error('VAPID鍵が設定されていません')
  return { subject: SUBJECT, publicKey, privateKey }
}

// Vercel の Upstash 連携で入る環境変数の名前は2通りあるので、どちらでも動くようにする
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (url && token) return new Redis({ url, token })
  // 公開中のアプリでデータベースがないと、宛先が消えてしまうので止める
  if (process.env.VERCEL) throw new Error('データベースが設定されていません')
  return null
}

// 自分のPCで試すとき用の置き場所（サーバーを止めると消える）
const memoryStore = new Map()

// ブラウザから送られてきた宛先が、正しい形かどうか
export function isValidSubscription(sub) {
  if (!sub || typeof sub.endpoint !== 'string') return false
  if (typeof sub.keys?.p256dh !== 'string' || typeof sub.keys?.auth !== 'string') return false
  try {
    const url = new URL(sub.endpoint)
    return url.protocol === 'https:' && PUSH_HOSTS.some((host) => host.test(url.hostname))
  } catch {
    return false
  }
}

export async function saveSubscription(sub) {
  const value = { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }
  const redis = getRedis()
  if (redis) await redis.hset(STORE_KEY, { [sub.endpoint]: value })
  else memoryStore.set(sub.endpoint, value)
}

export async function removeSubscription(endpoint) {
  const redis = getRedis()
  if (redis) await redis.hdel(STORE_KEY, endpoint)
  else memoryStore.delete(endpoint)
}

export async function listSubscriptions() {
  const redis = getRedis()
  if (!redis) return [...memoryStore.values()]
  const all = (await redis.hgetall(STORE_KEY)) ?? {}
  // 保存のしかたによって文字列で返ってくることがあるので、そろえる
  return Object.values(all).map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
}

// 合図を1件送る。宛先がもう使えない（通知をオフにした・アプリを消した）ときは false
export async function sendPush(sub, payload) {
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload), {
      vapidDetails: getVapidDetails(),
      TTL: 6 * 60 * 60, // 端末の電源が切れていても、6時間以内に届けばよい
    })
    return true
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) return false
    throw error
  }
}
