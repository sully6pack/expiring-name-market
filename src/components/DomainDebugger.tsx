
import { useEffect, useState } from 'react';
import { mockDomains } from '@/lib/mockData';
import { toast } from 'sonner';

const DomainDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<{
    mockDomains: number;
    domainsDisplay: number;
  }>({
    mockDomains: mockDomains.length,
    domainsDisplay: 0,
  });

  // Update debug info every 500ms
  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        // Count domains currently displayed on the page
        const domainCards = document.querySelectorAll('.domain-card');
        
        setDebugInfo({
          mockDomains: mockDomains.length,
          domainsDisplay: domainCards.length,
        });
        
        console.log('Domain Debug Info:', {
          mockDomainsLength: mockDomains.length,
          domainsOnPage: domainCards.length,
          firstMockDomain: mockDomains.length > 0 ? mockDomains[0] : null
        });
      } catch (error) {
        console.error('Error in DomainDebugger:', error);
      }
    };

    // Update immediately
    updateDebugInfo();
    
    // Then update every 1000ms
    const interval = setInterval(updateDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    window.location.reload();
    toast.success("Page reloaded");
  };

  return (
    <div className="fixed bottom-2 right-2 bg-gray-100 p-2 text-xs rounded shadow-md z-50">
      <p className="font-bold">Domains:</p>
      <ul>
        <li>mockDomains: {debugInfo.mockDomains}</li>
        <li>displayed: {debugInfo.domainsDisplay}</li>
      </ul>
      <div className="flex gap-1 mt-1">
        <button 
          onClick={handleReload}
          className="px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default DomainDebugger;
