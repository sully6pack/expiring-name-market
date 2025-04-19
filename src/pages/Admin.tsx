import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Domain, User, VerificationMethod } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/validation";
import { 
  getUserManagementInfo, 
  getAdminStats, 
  updateUser,
  AdminStats
} from "@/services/adminService";
import UserManagementTab from "@/components/admin/UserManagementTab";
import FAQManagementTab from "@/components/admin/FAQManagementTab";
import AdvertisementManagementTab from "@/components/admin/AdvertisementManagementTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUser } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { convertDbDomainToDomain } from "@/lib/supabase";
import { validateDomainCategory, validateVerificationStatus } from "@/utils/domainValidation";

const validateVerificationMethod = (method?: string): VerificationMethod | undefined => {
  if (!method) return undefined;
  
  if (Object.values(VerificationMethod).includes(method as VerificationMethod)) {
    return method as VerificationMethod;
  }
  return undefined;
};

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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

  const { 
    data: domains = [],
    isLoading: isLoadingDomains 
  } = useQuery({
    queryKey: ['admin-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching domains:', error);
        toast({
          title: "Error Loading Domains",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(item => {
        const baseDomain = convertDbDomainToDomain(item);
        return {
          ...baseDomain,
          category: validateDomainCategory(item.category),
          verificationStatus: validateVerificationStatus(item.verification_status),
          verificationMethod: validateVerificationMethod(item.verification_method)
        };
      });
    },
    enabled: !isLoading,
  });

  const { 
    data: users = [],
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUserManagementInfo,
    enabled: !isLoading,
  });

  const { 
    data: stats,
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    enabled: !isLoading,
  });

  const toggleAdminPickMutation = useMutation({
    mutationFn: async ({ domainId, isAdminPick }: { domainId: string, isAdminPick: boolean }) => {
      console.log(`Setting admin pick for domain ${domainId} to ${isAdminPick}`);
      const { data, error } = await supabase
        .from('domains')
        .update({ is_admin_pick: isAdminPick })
        .eq('id', domainId)
        .select();
        
      if (error) throw error;
      return { domainId, isAdminPick, data };
    },
    onSuccess: (result) => {
      console.log(`Admin pick update successful:`, result);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      toast({
        title: result.isAdminPick ? "Added to Staff Picks" : "Removed from Staff Picks",
        description: `Domain has been ${result.isAdminPick ? "added to" : "removed from"} the Staff Picks leaderboard`,
      });
    },
    onError: (error: any) => {
      console.error(`Admin pick update failed:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to update domain",
        variant: "destructive",
      });
    }
  });

  const toggleSponsoredMutation = useMutation({
    mutationFn: async ({ domainId, isSponsored }: { domainId: string, isSponsored: boolean }) => {
      console.log(`Setting sponsored for domain ${domainId} to ${isSponsored}`);
      const { data, error } = await supabase
        .from('domains')
        .update({ is_sponsored: isSponsored })
        .eq('id', domainId)
        .select();
        
      if (error) throw error;
      return { domainId, isSponsored, data };
    },
    onSuccess: (result) => {
      console.log(`Sponsored update successful:`, result);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      toast({
        title: result.isSponsored ? "Added to Sponsored" : "Removed from Sponsored",
        description: `Domain has been ${result.isSponsored ? "added to" : "removed from"} the Sponsored leaderboard`,
      });
    },
    onError: (error: any) => {
      console.error(`Sponsored update failed:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to update domain",
        variant: "destructive",
      });
    }
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);
        
      if (error) throw error;
      return domainId;
    },
    onSuccess: (domainId) => {
      console.log(`Domain ${domainId} removed successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      toast({
        title: "Domain Removed",
        description: "The domain has been removed",
      });
    },
    onError: (error: any) => {
      console.error(`Domain removal failed:`, error);
      toast({
        title: "Error Removing Domain",
        description: error.message || "Failed to remove domain",
        variant: "destructive",
      });
    }
  });

  const [switchStates, setSwitchStates] = useState<{
    [key: string]: { 
      adminPick: boolean; 
      sponsored: boolean;
      isAdminPickChanging: boolean;
      isSponsoredChanging: boolean;
    }
  }>({});

  useEffect(() => {
    if (domains.length > 0) {
      const initialStates = domains.reduce((acc, domain) => {
        acc[domain.id] = {
          adminPick: domain.isAdminPick,
          sponsored: domain.isSponsored,
          isAdminPickChanging: false,
          isSponsoredChanging: false
        };
        return acc;
      }, {} as { 
        [key: string]: { 
          adminPick: boolean; 
          sponsored: boolean;
          isAdminPickChanging: boolean;
          isSponsoredChanging: boolean;
        } 
      });
      
      setSwitchStates(initialStates);
    }
  }, [domains]);

  useEffect(() => {
    const handleAdminPickChanged = (event: CustomEvent) => {
      const { domainId, isAdminPick } = event.detail;
      console.log(`Received admin pick change event: ${domainId} -> ${isAdminPick}`);
      
      setSwitchStates(prev => ({
        ...prev,
        [domainId]: {
          ...prev[domainId],
          adminPick: isAdminPick,
          isAdminPickChanging: false
        }
      }));
    };

    const handleSponsoredChanged = (event: CustomEvent) => {
      const { domainId, isSponsored } = event.detail;
      console.log(`Received sponsored change event: ${domainId} -> ${isSponsored}`);
      
      setSwitchStates(prev => ({
        ...prev,
        [domainId]: {
          ...prev[domainId],
          sponsored: isSponsored,
          isSponsoredChanging: false
        }
      }));
    };

    const handleDomainUpdated = (event: CustomEvent) => {
      const updatedDomain = event.detail;
      console.log(`Received domain update event:`, updatedDomain);
      
      if (updatedDomain && updatedDomain.id) {
        setSwitchStates(prev => {
          if (!prev[updatedDomain.id]) return prev;
          
          return {
            ...prev,
            [updatedDomain.id]: {
              ...prev[updatedDomain.id],
              adminPick: updatedDomain.is_admin_pick,
              sponsored: updatedDomain.is_sponsored,
              isAdminPickChanging: false,
              isSponsoredChanging: false
            }
          };
        });
      }
    };

    window.addEventListener('domain-admin-pick-changed', handleAdminPickChanged as EventListener);
    window.addEventListener('domain-sponsored-changed', handleSponsoredChanged as EventListener);
    window.addEventListener('domain-updated', handleDomainUpdated as EventListener);

    return () => {
      window.removeEventListener('domain-admin-pick-changed', handleAdminPickChanged as EventListener);
      window.removeEventListener('domain-sponsored-changed', handleSponsoredChanged as EventListener);
      window.removeEventListener('domain-updated', handleDomainUpdated as EventListener);
    };
  }, []);

  const toggleAdminPick = useCallback((domain: Domain) => {
    const currentState = switchStates[domain.id]?.adminPick ?? domain.isAdminPick;
    const newValue = !currentState;
    
    setSwitchStates(prev => ({
      ...prev,
      [domain.id]: {
        ...prev[domain.id],
        adminPick: newValue,
        isAdminPickChanging: true
      }
    }));

    toggleAdminPickMutation.mutate(
      { domainId: domain.id, isAdminPick: newValue },
      {
        onError: () => {
          setSwitchStates(prev => ({
            ...prev,
            [domain.id]: {
              ...prev[domain.id],
              adminPick: currentState,
              isAdminPickChanging: false
            }
          }));
        }
      }
    );
  }, [switchStates, toggleAdminPickMutation]);

  const toggleSponsored = useCallback((domain: Domain) => {
    const currentState = switchStates[domain.id]?.sponsored ?? domain.isSponsored;
    const newValue = !currentState;
    
    setSwitchStates(prev => ({
      ...prev,
      [domain.id]: {
        ...prev[domain.id],
        sponsored: newValue,
        isSponsoredChanging: true
      }
    }));

    toggleSponsoredMutation.mutate(
      { domainId: domain.id, isSponsored: newValue },
      {
        onError: () => {
          setSwitchStates(prev => ({
            ...prev,
            [domain.id]: {
              ...prev[domain.id],
              sponsored: currentState,
              isSponsoredChanging: false
            }
          }));
        }
      }
    );
  }, [switchStates, toggleSponsoredMutation]);

  const handleRemoveDomain = (domain: Domain) => {
    removeDomainMutation.mutate(domain.id);
  };

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
            <TabsTrigger value="faqs">Manage FAQs</TabsTrigger>
            <TabsTrigger value="advertisements">Manage Ads</TabsTrigger>
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
                                checked={switchStates[domain.id]?.adminPick ?? domain.isAdminPick}
                                onCheckedChange={() => !switchStates[domain.id]?.isAdminPickChanging && toggleAdminPick(domain)}
                                disabled={switchStates[domain.id]?.isAdminPickChanging}
                                className={switchStates[domain.id]?.isAdminPickChanging ? "opacity-70" : ""}
                              />
                              <Label htmlFor={`admin-pick-${domain.id}`}>
                                {switchStates[domain.id]?.adminPick ? "Yes" : "No"}
                                {switchStates[domain.id]?.isAdminPickChanging && "..."}
                              </Label>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`sponsored-${domain.id}`}
                                checked={switchStates[domain.id]?.sponsored ?? domain.isSponsored}
                                onCheckedChange={() => !switchStates[domain.id]?.isSponsoredChanging && toggleSponsored(domain)}
                                disabled={switchStates[domain.id]?.isSponsoredChanging}
                                className={switchStates[domain.id]?.isSponsoredChanging ? "opacity-70" : ""}
                              />
                              <Label htmlFor={`sponsored-${domain.id}`}>
                                {switchStates[domain.id]?.sponsored ? "Yes" : "No"}
                                {switchStates[domain.id]?.isSponsoredChanging && "..."}
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
          
          <TabsContent value="faqs">
            <FAQManagementTab />
          </TabsContent>

          <TabsContent value="advertisements">
            <Card>
              <CardHeader>
                <CardTitle>Advertisements</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvertisementManagementTab />
              </CardContent>
            </Card>
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
