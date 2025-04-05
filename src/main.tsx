
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalDomains, mockDomains } from './lib/mockData.ts'

// Create global domains array if it doesn't exist
if (typeof window !== 'undefined' && (!window.globalDomains || !Array.isArray(window.globalDomains))) {
  console.log('Main.tsx: Creating window.globalDomains array');
  window.globalDomains = [];
}

// Clear localStorage to start fresh
try {
  console.log('Main.tsx: Clearing localStorage');
  localStorage.removeItem('globalDomains');
} catch (e) {
  console.error('Error clearing localStorage:', e);
}

console.log('Main.tsx: Initializing global domains');
// Initialize global domains - this will populate both localStorage and window.globalDomains
initializeGlobalDomains();

// Verify domains were initialized
if (!window.globalDomains || window.globalDomains.length === 0) {
  console.warn('Warning: window.globalDomains is empty after initialization');
  
  // Force manual initialization as a fallback
  console.log('Main.tsx: Force manual initialization with mock data');
  window.globalDomains = [];
  mockDomains.forEach(domain => {
    window.globalDomains.push({
      ...domain,
      expirationDate: new Date(domain.expirationDate),
      createdAt: new Date(domain.createdAt)
    });
  });
  
  // Also update localStorage
  try {
    localStorage.setItem('globalDomains', JSON.stringify(mockDomains));
  } catch (e) {
    console.error('Error setting localStorage:', e);
  }
  
  console.log('After manual initialization:', window.globalDomains?.length || 0);
}

// Create root after ensuring domains are initialized
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
