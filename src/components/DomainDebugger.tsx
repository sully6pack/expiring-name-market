
import { useEffect, useState } from 'react';
import { Domain } from '@/types';
import { mockDomains } from '@/lib/mockData';

const DomainDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<{
    localStorageDomains: number;
    windowGlobalDomains: number;
    mockDomains: number;
    domainsDisplay: number;
  }>({
    localStorageDomains: 0,
    windowGlobalDomains: 0,
    mockDomains: mockDomains.length,
    domainsDisplay: 0,
  });

  // Update debug info every second (more frequent updates)
  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        // Check localStorage
        const storedDomains = localStorage.getItem('globalDomains');
        const parsedStoredDomains = storedDomains ? JSON.parse(storedDomains) : [];
        
        // Check window.globalDomains
        const windowDomains = window.globalDomains || [];

        // Count domains currently displayed on the page
        const domainCards = document.querySelectorAll('.domain-card');
        
        setDebugInfo({
          localStorageDomains: parsedStoredDomains.length,
          windowGlobalDomains: windowDomains.length,
          mockDomains: mockDomains.length,
          domainsDisplay: domainCards.length,
        });
        
        console.log('Domain Debug Info:', {
          localStorageDomains: parsedStoredDomains,
          windowGlobalDomains: windowDomains,
          mockDomains,
          domainsOnPage: domainCards.length,
        });
      } catch (error) {
        console.error('Error in DomainDebugger:', error);
      }
    };

    // Update immediately
    updateDebugInfo();
    
    // Then update every 1 second (more frequent than before)
    const interval = setInterval(updateDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleForceSync = () => {
    try {
      // Force sync mockDomains to both localStorage and window.globalDomains
      localStorage.setItem('globalDomains', JSON.stringify(mockDomains));
      window.globalDomains = [...mockDomains];
      console.log('Manually synced domains from mockData');
    } catch (error) {
      console.error('Error in manual sync:', error);
    }
  };

  return (
    <div className="fixed bottom-2 right-2 bg-gray-100 p-2 text-xs rounded shadow-md z-50">
      <p className="font-bold">Domains Loaded:</p>
      <ul>
        <li>localStorage: {debugInfo.localStorageDomains}</li>
        <li>globalDomains: {debugInfo.windowGlobalDomains}</li>
        <li>mockDomains: {debugInfo.mockDomains}</li>
        <li>displayed: {debugInfo.domainsDisplay}</li>
      </ul>
      <div className="flex gap-1 mt-1">
        <button 
          onClick={handleForceSync}
          className="px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Force Sync
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('globalDomains');
            window.location.reload();
          }}
          className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};

export default DomainDebugger;
