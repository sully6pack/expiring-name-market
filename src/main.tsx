
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { mockDomains } from './lib/mockData';

console.log('Main.tsx: Starting app initialization');

// Clear any previous state that might be causing issues
if (typeof localStorage !== 'undefined') {
  console.log('Main.tsx: Clearing localStorage');
  localStorage.removeItem('globalDomains');
}

// Ensure window.globalDomains is properly initialized with fresh data
if (typeof window !== 'undefined') {
  console.log('Main.tsx: Setting up window.globalDomains');
  window.globalDomains = mockDomains.map(domain => ({
    ...domain,
    expirationDate: new Date(domain.expirationDate),
    createdAt: new Date(domain.createdAt)
  }));
  console.log('Main.tsx: window.globalDomains count:', window.globalDomains.length);
}

// Create root
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
