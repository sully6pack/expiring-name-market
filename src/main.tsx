import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react';
import { initializeRealtime } from './integrations/supabase/enableRealtime';

// Initialize realtime for domains and likes
initializeRealtime().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
