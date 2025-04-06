
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Domain, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/validation";
import { 
  getUserManagementInfo, 
  getAdminStats, 
  setDomainAsAdminPick, 
  setDomainAsSponsored,
  removeDomain,
  AdminStats
} from "@/services/adminService";
import UserManagementTab from "@/components/admin/UserManagementTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUser } from "@/lib/mockData";
import { getAllDomains } from "@/services/domainService";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Check authentication
  useEffect(() => {
    // Check if user is authenticated and is an admin
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

  // Fetch domains with React Query
  const { 
    data: domains = [],
    isLoading: isLoadingDomains 
  } = useQuery({
    queryKey: ['admin-domains'],
    queryFn: getAllDomains,
    enabled: !isLoading,
  });

  // Fetch users with React Query
  const { 
    data: users = [],
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUserManagementInfo,
    enabled: !isLoading,
  });

  // Fetch stats with React Query
  const { 
    data: stats,
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    enabled: !isLoading,
  });

  // Mutations for domain actions
  const toggleAdminPickMutation = useMutation({
    mutationFn: ({ domainId, isAdminPick }: { domainId: string, isAdminPick: boolean }) => 
      setDomainAsAdminPick(domainId, isAdminPick),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
    }
  });

  const toggleSponsoredMutation = useMutation({
    mutationFn: ({ domainId, isSponsored }: { domainId: string, isSponsored: boolean }) => 
      setDomainAsSponsored(domainId, isSponsored),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
    }
  });

  const removeDomainMutation = useMutation({
    mutationFn: (domainId: string) => removeDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
    }
  });

  const toggleAdminPick = (domain: Domain) => {
    toggleAdminPickMutation.mutate(
      { domainId: domain.id, isAdminPick: !domain.isAdminPick },
      {
        onSuccess: () => {
          toast({
            title: domain.isAdminPick ? "Removed from Staff Picks" : "Added to Staff Picks",
            description: `${domain.name} has been ${domain.isAdminPick ? "removed from" : "added to"} the Staff Picks leaderboard`,
          });
        }
      }
    );
  };

  const toggleSponsored = (domain: Domain) => {
    toggleSponsoredMutation.mutate(
      { domainId: domain.id, isSponsored: !domain.isSponsored },
      {
        onSuccess: () => {
          toast({
            title: domain.isSponsored ? "Removed from Sponsored" : "Added to Sponsored",
            description: `${domain.name} has been ${domain.isSponsored ? "removed from" : "added to"} the Sponsored leaderboard`,
          });
        }
      }
    );
  };

  const handleRemoveDomain = (domain: Domain) => {
    removeDomainMutation.mutate(domain.id, {
      onSuccess: () => {
        toast({
          title: "Domain Removed",
          description: `${domain.name} has been removed`,
        });
      }
    });
  };

  // If we're still checking authentication or loading data, show a loading state
  if (isLoading || isLoadingDomains || isLoadingUsers) {
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
          <TabsList>
            <TabsTrigger value="domains">Manage Domains</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="domains">
            <Card>
              <CardHeader>
                <CardTitle>All Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3">Domain Name</th>
                        <th className="text-left p-3">Seller</th>
                        <th className="text-left p-3">Expiration</th>
                        <th className="text-left p-3">Likes</th>
                        <th className="text-left p-3">Staff Pick</th>
                        <th className="text-left p-3">Sponsored</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id} className="border-b">
                          <td className="p-3">{domain.name}</td>
                          <td className="p-3">{domain.sellerName}</td>
                          <td className="p-3">{formatDate(domain.expirationDate)}</td>
                          <td className="p-3">{domain.likes}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`admin-pick-${domain.id}`}
                                checked={domain.isAdminPick}
                                onCheckedChange={() => toggleAdminPick(domain)}
                              />
                              <Label htmlFor={`admin-pick-${domain.id}`}>
                                {domain.isAdminPick ? "Yes" : "No"}
                              </Label>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`sponsored-${domain.id}`}
                                checked={domain.isSponsored}
                                onCheckedChange={() => toggleSponsored(domain)}
                              />
                              <Label htmlFor={`sponsored-${domain.id}`}>
                                {domain.isSponsored ? "Yes" : "No"}
                              </Label>
                            </div>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveDomain(domain)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagementTab users={users} />
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Domains</p>
                      <h3 className="text-3xl font-bold">{stats?.totalDomains || domains.length}</h3>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <h3 className="text-3xl font-bold">{stats?.totalUsers || users.length}</h3>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Completed Sales</p>
                      <h3 className="text-3xl font-bold">{stats?.recentPurchases || 7}</h3>
                    </CardContent>
                  </Card>
                  {stats?.revenue && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <h3 className="text-3xl font-bold">${stats.revenue.toFixed(2)}</h3>
                      </CardContent>
                    </Card>
                  )}
                  {stats?.pendingVerifications !== undefined && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Pending Verifications</p>
                        <h3 className="text-3xl font-bold">{stats.pendingVerifications}</h3>
                      </CardContent>
                    </Card>
                  )}
                  {stats?.activeSellers !== undefined && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Active Sellers</p>
                        <h3 className="text-3xl font-bold">{stats.activeSellers}</h3>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
