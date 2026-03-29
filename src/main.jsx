import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Privacy from './Privacy.jsx'
import WhoopCallback from './WhoopCallback.jsx'
import './index.css'

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/privacy' ? <Privacy /> :
     path === '/whoop/callback' ? <WhoopCallback /> :
     <App />}
  </StrictMode>,
)
