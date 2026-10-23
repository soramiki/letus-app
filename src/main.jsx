import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// サービスワーカー（裏で動く処理）を登録する。通知と、電波がないときに開くために使う
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js', {
    type: import.meta.env.DEV ? 'module' : 'classic',
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
