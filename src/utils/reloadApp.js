// アプリを読み込み直す
// ホーム画面から開いたアプリには、ブラウザの再読み込みボタンがないので、そのかわりに使う。
// 新しい版が公開されていれば、それに入れ替えてから読み込み直す（課題のデータはそのまま）
export async function reloadApp() {
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) {
      // 新しい版があるか確かめる
      await registration.update()
      // 新しい版を入れている最中なら、入れ替わるまで待つ（長くても3秒）
      if (registration.installing || registration.waiting) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
          setTimeout(resolve, 3000)
        })
      }
    }
  } catch {
    // 確かめられなくても、読み込み直しはする
  }
  window.location.reload()
}
