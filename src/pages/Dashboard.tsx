
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Domain, DomainCategory, VerificationStatus } from "@/types";
import { isDomainValid } from "@/utils/validation";
import { extractTLD } from "@/utils/domainUtils";
import { filterOutPurchasedDomains, logPurchasedDomains } from "@/utils/purchaseUtils";
import { getAllDomains, addDomain, deleteDomain } from "@/services/domainService";

// Import tab components
import MyDomainsTab from "@/components/dashboard/MyDomainsTab";
import ListDomainTab from "@/components/dashboard/ListDomainTab";
import InterestedBuyersTab from "@/components/dashboard/InterestedBuyersTab";
import AccountSettingsTab from "@/components/dashboard/AccountSettingsTab";

const Dashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<{ domainId: string; buyerName: string; email: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard: Loading domains...");
    logPurchasedDomains();
    
    // Get all domains from our domain service
    const allDomains = getAllDomains();
    console.log(`Dashboard: Found ${allDomains.length} total domains`);
    
    // Get user's domains
    const userDomains = allDomains.filter(domain => domain.sellerId === currentUser.id);
    console.log(`Dashboard: Found ${userDomains.length} domains owned by current user`);
    
    // Make sure to only show domains that haven't been purchased
    const availableDomains = filterOutPurchasedDomains(userDomains);
    console.log(`Dashboard: ${availableDomains.length} domains available after filtering out purchased domains`);
    
    setMyDomains(availableDomains);
    setInterestedBuyers([
      { 
        domainId: allDomains[0]?.id || "domain1", 
        buyerName: "John Doe", 
        email: "john@example.com" 
      },
      { 
        domainId: allDomains[2]?.id || "domain3", 
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

    // Only validate expiration date if one was provided
    if (domainData.expirationDate && !isDomainValid(domainData.expirationDate)) {
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
      console.log(`Adding new domain: ${domainData.domainName}`);
      
      // Set a default expiration date if one wasn't provided
      const expirationDate = domainData.expirationDate || (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 3); // Default to 3 months from now
        return date;
      })();
      
      // Use our domain service to add the new domain
      const newDomain = addDomain({
        name: domainData.domainName,
        description: domainData.description,
        expirationDate,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        category: domainData.category
      });
      
      toast({
        title: "Domain Listed",
        description: `${domainData.domainName} has been successfully listed`,
      });
      
      // Update local state
      setMyDomains(prevDomains => [newDomain, ...prevDomains]);
      setIsSubmitting(false);
      
    }, 1000);
  };

  const handleDeleteDomain = (domainToDelete: Domain) => {
    // Use our domain service to delete the domain
    const success = deleteDomain(domainToDelete.id);
    
    if (success) {
      // Update local state
      setMyDomains(prevDomains => prevDomains.filter(domain => domain.id !== domainToDelete.id));
      
      toast({
        title: "Domain Removed",
        description: `${domainToDelete.name} has been removed from your listings`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to remove ${domainToDelete.name}. Please try again.`,
      });
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
            <InterestedBuyersTab buyers={interestedBuyers} domains={getAllDomains()} />
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
