import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Entry point for the client-side React application.
 * 
 * 1. Targets the HTML div with the ID 'root' in index.html as the mounting point.
 * 2. Uses the React 18 createRoot API to initialize the React application context.
 * 3. Renders the main App component inside <StrictMode> to catch bugs, warnings, and unsafe lifecycle practices early in development.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

