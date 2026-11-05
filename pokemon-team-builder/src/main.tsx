import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/press-start-2p'
// After the Fontsource faces, so the browser tries these small subsets first.
import './assets/fonts/fonts.css'
import './index.css'
import App from './App.tsx'
import { initTheme } from './store/themeStore.ts'

// Sync dark class with persisted preference before first render
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
