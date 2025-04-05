
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

  useEffect(() => {
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
  }, []);

  return (
    <div className="fixed bottom-2 right-2 bg-gray-100 p-2 text-xs rounded shadow-md z-50">
      <p>Domains Loaded:</p>
      <ul>
        <li>localStorage: {debugInfo.localStorageDomains}</li>
        <li>globalDomains: {debugInfo.windowGlobalDomains}</li>
        <li>mockDomains: {debugInfo.mockDomains}</li>
      </ul>
    </div>
  );
};

export default DomainDebugger;
