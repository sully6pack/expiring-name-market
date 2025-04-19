
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mockData";
import StatisticsTab from "@/components/admin/StatisticsTab";
import DomainManagementTab from "@/components/admin/DomainManagementTab";
import UserManagementTab from "@/components/admin/UserManagementTab";
import FAQManagementTab from "@/components/admin/FAQManagementTab";
import AdvertisementManagementTab from "@/components/admin/AdvertisementManagementTab";
import { useQuery } from "@tanstack/react-query";
import { getUserManagementInfo } from "@/services/adminService";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch users for user management tab
  const { 
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUserManagementInfo,
  });

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to view this page.",
        variant: "destructive",
      });
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  if (isLoading || isLoadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <Tabs defaultValue="domains" className="space-y-4">
          <TabsList className="flex flex-wrap w-full">
            <TabsTrigger value="domains">Manage Domains</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="faqs">Manage FAQs</TabsTrigger>
            <TabsTrigger value="advertisements">Manage Ads</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="domains">
            <DomainManagementTab />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagementTab users={users} />
          </TabsContent>
          
          <TabsContent value="faqs">
            <FAQManagementTab />
          </TabsContent>

          <TabsContent value="advertisements">
            <AdvertisementManagementTab />
          </TabsContent>
          
          <TabsContent value="stats">
            <StatisticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
