
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalDomains } from './lib/mockData.ts'

// Initialize global domains before rendering the app
initializeGlobalDomains();

createRoot(document.getElementById("root")!).render(<App />);
