import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Handle loading spinner
const removeLoader = () => {
  const loader = document.getElementById('app-loading')
  if (loader) {
    loader.style.opacity = '0'
    loader.style.visibility = 'hidden'
    setTimeout(() => {
      loader.remove()
    }, 500)
  }
}

// Remove loader when page is fully loaded (including static resources)
if (document.readyState === 'complete') {
  removeLoader()
} else {
  window.addEventListener('load', removeLoader)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
