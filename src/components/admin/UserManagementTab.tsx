
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/validation";
import { User } from "@/types";
import { UserCheck, UserX, User as UserIcon, Shield } from "lucide-react";

interface UserManagementTabProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagementTab = ({ users, setUsers }: UserManagementTabProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleAdmin = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, isAdmin: !user.isAdmin } 
          : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast({
        title: user.isAdmin ? "Admin Rights Removed" : "Admin Rights Granted",
        description: `${user.name} is ${user.isAdmin ? "no longer" : "now"} an admin`,
      });
    }
  };

  const handleToggleVerification = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, isVerified: !user.isVerified, verifiedAt: !user.isVerified ? new Date() : undefined } 
          : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast({
        title: user.isVerified ? "Verification Removed" : "User Verified",
        description: `${user.name} is ${user.isVerified ? "no longer verified" : "now verified"}`,
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    
    if (user) {
      toast({
        title: "User Removed",
        description: `${user.name} has been removed from the platform`,
      });
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email for the new user",
        variant: "destructive",
      });
      return;
    }
    
    const newUserId = `user_${Math.random().toString(36).substring(2, 9)}`;
    
    const createdUser: User = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      isVerified: false,
      createdAt: new Date(),
    };
    
    setUsers(prevUsers => [createdUser, ...prevUsers]);
    
    toast({
      title: "User Added",
      description: `${newUser.name} has been added to the platform`,
    });
    
    // Reset the form
    setNewUser({
      name: "",
      email: "",
      isAdmin: false
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-xs"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isAdmin" className="text-right">
                    Admin User
                  </Label>
                  <div className="col-span-3">
                    <Switch
                      id="isAdmin"
                      checked={newUser.isAdmin}
                      onCheckedChange={(checked) => setNewUser({...newUser, isAdmin: checked})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  {searchQuery ? "No users match your search criteria" : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`verified-${user.id}`}
                        checked={!!user.isVerified}
                        onCheckedChange={() => handleToggleVerification(user.id)}
                      />
                      <Badge variant={user.isVerified ? "default" : "outline"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`admin-${user.id}`}
                        checked={!!user.isAdmin}
                        onCheckedChange={() => handleToggleAdmin(user.id)}
                      />
                      {user.isAdmin && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVerification(user.id)}
                      >
                        {user.isVerified ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagementTab;
