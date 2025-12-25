import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/main.css'
import App from './App.jsx'
import { CategoryProvider } from './store/CategoryContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </StrictMode>,
)