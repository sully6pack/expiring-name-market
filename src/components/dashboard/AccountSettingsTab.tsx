
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AccountSettingsTabProps {
  user: User;
}

const AccountSettingsTab = ({ user }: AccountSettingsTabProps) => {
  const { refreshUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [company, setCompany] = useState(user.company || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("users")
        .update({
          name,
          phone,
          company
        })
        .eq("id", user.id);
      
      if (error) {
        toast.error("Failed to save changes: " + error.message);
        return;
      }
      
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An unexpected error occurred while saving your profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account details and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account-email">Email</Label>
          <Input
            id="account-email"
            value={user.email}
            disabled={true}
          />
          <p className="text-sm text-gray-500">Email cannot be changed</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account-phone">Phone (optional)</Label>
          <Input
            id="account-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account-company">Company (optional)</Label>
          <Input
            id="account-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company name"
          />
        </div>
        
        <Button 
          type="button" 
          onClick={handleSaveChanges} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsTab;
