import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

// Register SW with immediate update — no stale cache
registerSW({
  // Check for updates every 60 seconds while the app is open
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 1000)
    }
  },
})

// When a new SW activates and takes control, reload to pick up new assets.
// This fires after skipWaiting + clientsClaim on the new SW.
let refreshing = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
