
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";

interface AccountSettingsTabProps {
  user: User;
}

const AccountSettingsTab = ({ user }: AccountSettingsTabProps) => {
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
            defaultValue={user.name}
            disabled={false}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account-email">Email</Label>
          <Input
            id="account-email"
            defaultValue={user.email}
            disabled={false}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account-password">Password</Label>
          <Input
            id="account-password"
            type="password"
            defaultValue="********"
            disabled={false}
          />
        </div>
        
        <Button type="submit">Save Changes</Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsTab;
