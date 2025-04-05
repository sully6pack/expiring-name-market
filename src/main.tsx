
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { mockDomains } from './lib/mockData';

// Set global domains directly from mock data
if (typeof window !== 'undefined') {
  window.globalDomains = mockDomains;
  console.log('Main.tsx: Initialized window.globalDomains with', window.globalDomains.length, 'domains');
}

// Create root and render app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(<App />);
