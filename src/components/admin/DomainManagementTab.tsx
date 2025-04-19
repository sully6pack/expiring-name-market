
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Domain, DomainCategory, VerificationStatus, VerificationMethod } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  validateDomainCategory, 
  validateVerificationStatus, 
  validateVerificationMethod 
} from "@/utils/domainValidation";
import { 
  setDomainAsAdminPick, 
  setDomainAsSponsored, 
  removeDomain 
} from "@/services/adminService";

const DomainManagementTab = () => {
  const { toast } = useToast();
  const [switchStates, setSwitchStates] = useState<{
    [key: string]: { 
      adminPick: boolean; 
      sponsored: boolean;
      isAdminPickChanging: boolean;
      isSponsoredChanging: boolean;
    }
  }>({});

  const queryClient = useQueryClient();
  
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
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        category: validateDomainCategory(item.category),
        verificationStatus: validateVerificationStatus(item.verification_status),
        verificationMethod: validateVerificationMethod(item.verification_method)
      }));
    },
  });

  // Toggle Admin Pick status
  const toggleAdminPick = async (domain: Domain) => {
    // First, update local state to show loading
    setSwitchStates(prev => ({
      ...prev,
      [domain.id]: {
        ...prev[domain.id] || { 
          adminPick: domain.isAdminPick,
          sponsored: domain.isSponsored,
          isSponsoredChanging: false,
        },
        adminPick: !domain.isAdminPick,
        isAdminPickChanging: true
      }
    }));
    
    try {
      const success = await setDomainAsAdminPick(domain.id, !domain.isAdminPick);
      
      if (success) {
        toast({
          title: "Domain Updated",
          description: `${domain.name} is ${!domain.isAdminPick ? "now" : "no longer"} an admin pick`,
        });
        
        // Update query cache
        queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      } else {
        throw new Error("Failed to update domain");
      }
    } catch (error) {
      console.error("Error toggling admin pick:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the domain status.",
        variant: "destructive",
      });
      
      // Revert the local state
      setSwitchStates(prev => ({
        ...prev,
        [domain.id]: {
          ...prev[domain.id],
          adminPick: domain.isAdminPick,
          isAdminPickChanging: false
        }
      }));
    } finally {
      // Clear loading state
      setSwitchStates(prev => ({
        ...prev,
        [domain.id]: {
          ...prev[domain.id],
          isAdminPickChanging: false
        }
      }));
    }
  };
  
  // Toggle Sponsored status
  const toggleSponsored = async (domain: Domain) => {
    // First, update local state to show loading
    setSwitchStates(prev => ({
      ...prev,
      [domain.id]: {
        ...prev[domain.id] || { 
          adminPick: domain.isAdminPick,
          sponsored: domain.isSponsored,
          isAdminPickChanging: false,
        },
        sponsored: !domain.isSponsored,
        isSponsoredChanging: true
      }
    }));
    
    try {
      const success = await setDomainAsSponsored(domain.id, !domain.isSponsored);
      
      if (success) {
        toast({
          title: "Domain Updated",
          description: `${domain.name} is ${!domain.isSponsored ? "now" : "no longer"} sponsored`,
        });
        
        // Update query cache
        queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      } else {
        throw new Error("Failed to update domain");
      }
    } catch (error) {
      console.error("Error toggling sponsored status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the domain status.",
        variant: "destructive",
      });
      
      // Revert the local state
      setSwitchStates(prev => ({
        ...prev,
        [domain.id]: {
          ...prev[domain.id],
          sponsored: domain.isSponsored,
          isSponsoredChanging: false
        }
      }));
    } finally {
      // Clear loading state
      setSwitchStates(prev => ({
        ...prev,
        [domain.id]: {
          ...prev[domain.id],
          isSponsoredChanging: false
        }
      }));
    }
  };
  
  // Remove domain
  const handleRemoveDomain = async (domain: Domain) => {
    if (!confirm(`Are you sure you want to remove ${domain.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const success = await removeDomain(domain.id);
      
      if (success) {
        toast({
          title: "Domain Removed",
          description: `${domain.name} has been removed from the platform`,
        });
        
        // Update query cache
        queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      } else {
        throw new Error("Failed to remove domain");
      }
    } catch (error) {
      console.error("Error removing domain:", error);
      toast({
        title: "Removal Failed",
        description: "There was an error removing the domain.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingDomains) {
    return <p className="text-center">Loading domains...</p>;
  }

  return (
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
  );
};

export default DomainManagementTab;
