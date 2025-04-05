
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
  // Force initialization with mock data as a fallback
  window.globalDomains = [];
  initializeGlobalDomains();
  console.log('After second initialization attempt:', window.globalDomains?.length || 0);
}

// Create root after ensuring domains are initialized
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
