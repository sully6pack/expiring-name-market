
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalDomains } from './lib/mockData.ts'

// Initialize global domains before rendering the app
console.log('Main.tsx: Initializing global domains');
initializeGlobalDomains();

// Ensure window.globalDomains is created before rendering
if (!window.globalDomains || window.globalDomains.length === 0) {
  console.warn('Warning: window.globalDomains is empty or undefined after initialization');
}

createRoot(document.getElementById("root")!).render(<App />);
