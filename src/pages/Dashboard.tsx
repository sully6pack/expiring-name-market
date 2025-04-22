
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Update to correct import
import { useDashboardDomains } from "@/hooks/useDashboardDomains";

// Import tab components
import MyDomainsTab from "@/components/dashboard/MyDomainsTab";
import ListDomainTab from "@/components/dashboard/ListDomainTab";
import InterestedBuyersTab from "@/components/dashboard/InterestedBuyersTab";
import AccountSettingsTab from "@/components/dashboard/AccountSettingsTab";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Use our custom hook for domain operations
  const { 
    isSubmitting,
    myDomains,
    interestedBuyers,
    handleSubmitDomain,
    handleDeleteDomain,
    fetchUserDomains
  } = useDashboardDomains(currentUser?.id);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast.error("Please sign in to access your dashboard");
        navigate("/");
        return;
      }
      
      // Get user profile
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUser(userData.user);
    };
    
    checkAuth();
  }, [navigate]);

  const handleDomainUpdated = () => {
    if (currentUser?.id) {
      fetchUserDomains(currentUser.id);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Loading your dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we retrieve your information.</p>
        </div>
      </div>
    );
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
              onDomainUpdated={handleDomainUpdated}
            />
          </TabsContent>
          
          <TabsContent value="list-domain">
            <ListDomainTab onSubmit={handleSubmitDomain} isSubmitting={isSubmitting} />
          </TabsContent>
          
          <TabsContent value="interested-buyers">
            <InterestedBuyersTab buyers={interestedBuyers} domains={myDomains} />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountSettingsTab user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
