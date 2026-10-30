import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './i18n'
import { StoreProvider } from './state/store'
import { HealthProvider } from './state/health'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <StoreProvider>
        <HealthProvider>
          <App />
        </HealthProvider>
      </StoreProvider>
    </LangProvider>
  </StrictMode>,
)
