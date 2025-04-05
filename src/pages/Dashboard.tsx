
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDomains, currentUser } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Domain, DomainCategory, VerificationStatus } from "@/types";
import { isDomainValid } from "@/utils/validation";
import { extractTLD } from "@/utils/domainUtils";
import { filterOutPurchasedDomains, logPurchasedDomains } from "@/utils/purchaseUtils";

// Import tab components
import MyDomainsTab from "@/components/dashboard/MyDomainsTab";
import ListDomainTab from "@/components/dashboard/ListDomainTab";
import InterestedBuyersTab from "@/components/dashboard/InterestedBuyersTab";
import AccountSettingsTab from "@/components/dashboard/AccountSettingsTab";

if (!window.globalDomains) {
  window.globalDomains = [...mockDomains];
}

const Dashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<{ domainId: string; buyerName: string; email: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard: Loading domains...");
    logPurchasedDomains();
    
    if (!window.globalDomains) {
      window.globalDomains = [...mockDomains];
    }
    
    // Get user's domains that are not purchased
    const userDomains = window.globalDomains.filter(domain => domain.sellerId === currentUser.id);
    console.log(`Dashboard: Found ${userDomains.length} domains owned by current user`);
    
    // Make sure to only show domains that haven't been purchased
    const availableDomains = filterOutPurchasedDomains(userDomains);
    console.log(`Dashboard: ${availableDomains.length} domains available after filtering out purchased domains`);
    
    setMyDomains(availableDomains);
    setInterestedBuyers([
      { 
        domainId: mockDomains[0].id, 
        buyerName: "John Doe", 
        email: "john@example.com" 
      },
      { 
        domainId: mockDomains[2].id, 
        buyerName: "Alice Williams", 
        email: "alice@example.com" 
      },
    ]);
  }, []);

  const handleSubmitDomain = (domainData: {
    domainName: string;
    description: string;
    expirationDate: Date | undefined;
    category: DomainCategory;
  }) => {
    setIsSubmitting(true);

    if (!domainData.expirationDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an expiration date",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isDomainValid(domainData.expirationDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Expiration Date",
        description: "Domain must be expiring within the next 90 days and not more than 15 days past expiration",
      });
      setIsSubmitting(false);
      return;
    }

    const tld = extractTLD(domainData.domainName);
    
    if (!tld) {
      toast({
        variant: "destructive",
        title: "Invalid Domain",
        description: "Please enter a valid domain name with a TLD (e.g., .com, .org, .io)",
      });
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      if (!window.globalDomains) {
        window.globalDomains = [...mockDomains];
      }
      
      console.log(`Adding new domain: ${domainData.domainName}`);
      
      toast({
        title: "Domain Listed",
        description: `${domainData.domainName} has been successfully listed`,
      });
      
      const newDomain: Domain = {
        id: `domain${Math.random().toString(36).substring(7)}`,
        name: domainData.domainName,
        expirationDate: domainData.expirationDate,
        description: domainData.description,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        likes: 0,
        price: 99,
        isSponsored: false,
        isAdminPick: false,
        createdAt: new Date(),
        category: domainData.category,
        tld,
        verificationStatus: VerificationStatus.NOT_STARTED,
      };
      
      window.globalDomains = [...window.globalDomains, newDomain];
      setMyDomains(prevDomains => [newDomain, ...prevDomains]);
      setIsSubmitting(false);
      
      try {
        localStorage.setItem('globalDomains', JSON.stringify(window.globalDomains));
        console.log(`Domain ${domainData.domainName} added successfully. Total domains: ${window.globalDomains.length}`);
      } catch (error) {
        console.error('Error saving domains to localStorage:', error);
      }
    }, 1000);
  };

  const handleDeleteDomain = (domainToDelete: Domain) => {
    if (!window.globalDomains) {
      window.globalDomains = [...mockDomains];
    }
    
    // Filter out the domain to delete
    window.globalDomains = window.globalDomains.filter(domain => domain.id !== domainToDelete.id);
    
    // Update local state
    setMyDomains(prevDomains => prevDomains.filter(domain => domain.id !== domainToDelete.id));
    
    // Save to localStorage
    try {
      localStorage.setItem('globalDomains', JSON.stringify(window.globalDomains));
      console.log(`Domain ${domainToDelete.name} removed. Remaining domains: ${window.globalDomains.length}`);
    } catch (error) {
      console.error('Error saving domains to localStorage:', error);
    }
  };

  if (!currentUser) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        
        <Tabs defaultValue="my-domains" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-domains">My Domains</TabsTrigger>
            <TabsTrigger value="list-domain">List a Domain</TabsTrigger>
            <TabsTrigger value="interested-buyers">Interested Buyers</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-domains" className="space-y-4">
            <MyDomainsTab 
              domains={myDomains} 
              onDeleteDomain={handleDeleteDomain} 
            />
          </TabsContent>
          
          <TabsContent value="list-domain">
            <ListDomainTab onSubmit={handleSubmitDomain} isSubmitting={isSubmitting} />
          </TabsContent>
          
          <TabsContent value="interested-buyers">
            <InterestedBuyersTab buyers={interestedBuyers} domains={mockDomains} />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountSettingsTab user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    globalDomains: Domain[];
  }
}

export default Dashboard;
