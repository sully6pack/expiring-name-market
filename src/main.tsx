
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react';
// Remove the realtime initialization from main.tsx as it's now handled in the components
// import { initializeRealtime } from './integrations/supabase/enableRealtime';

// No longer initialize realtime here to avoid duplicate connections
// initializeRealtime().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
