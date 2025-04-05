
import { useEffect, useState } from 'react';
import { Domain } from '@/types';
import { mockDomains } from '@/lib/mockData';

const DomainDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<{
    localStorageDomains: number;
    windowGlobalDomains: number;
    mockDomains: number;
  }>({
    localStorageDomains: 0,
    windowGlobalDomains: 0,
    mockDomains: mockDomains.length,
  });

  // Update debug info every 2 seconds
  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        // Check localStorage
        const storedDomains = localStorage.getItem('globalDomains');
        const parsedStoredDomains = storedDomains ? JSON.parse(storedDomains) : [];
        
        // Check window.globalDomains
        const windowDomains = window.globalDomains || [];
        
        setDebugInfo({
          localStorageDomains: parsedStoredDomains.length,
          windowGlobalDomains: windowDomains.length,
          mockDomains: mockDomains.length,
        });
        
        console.log('Domain Debug Info:', {
          localStorageDomains: parsedStoredDomains,
          windowGlobalDomains: windowDomains,
          mockDomains,
        });
      } catch (error) {
        console.error('Error in DomainDebugger:', error);
      }
    };

    // Update immediately
    updateDebugInfo();
    
    // Then update every 2 seconds
    const interval = setInterval(updateDebugInfo, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-2 right-2 bg-gray-100 p-2 text-xs rounded shadow-md z-50">
      <p className="font-bold">Domains Loaded:</p>
      <ul>
        <li>localStorage: {debugInfo.localStorageDomains}</li>
        <li>globalDomains: {debugInfo.windowGlobalDomains}</li>
        <li>mockDomains: {debugInfo.mockDomains}</li>
      </ul>
      <button 
        onClick={() => {
          localStorage.removeItem('globalDomains');
          window.location.reload();
        }}
        className="mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
      >
        Reset Data
      </button>
    </div>
  );
};

export default DomainDebugger;
