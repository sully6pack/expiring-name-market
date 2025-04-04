
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { mockDomains, currentUser } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import DomainCard from "@/components/DomainCard";
import { Domain, DomainCategory } from "@/types";
import { isDomainValid } from "@/utils/validation";
import { extractTLD } from "@/utils/domainUtils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Create a global variable to store domains across the application
// This is a simple solution for this mock app - in a real app you'd use a state management solution
if (!window.globalDomains) {
  window.globalDomains = [...mockDomains];
}

const Dashboard = () => {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(addDays(new Date(), 14));
  const [category, setCategory] = useState<DomainCategory>(DomainCategory.Business);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<{ domainId: string; buyerName: string; email: string }[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setMyDomains(window.globalDomains.filter(domain => domain.sellerId === currentUser.id));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!expirationDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an expiration date",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isDomainValid(expirationDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Expiration Date",
        description: "Domain must be expiring within the next 30 days and not more than 30 days past expiration",
      });
      setIsSubmitting(false);
      return;
    }

    const tld = extractTLD(domainName);
    
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
      toast({
        title: "Domain Listed",
        description: `${domainName} has been successfully listed`,
      });
      
      const newDomain: Domain = {
        id: `domain${Math.random().toString(36).substring(7)}`,
        name: domainName,
        expirationDate: expirationDate,
        description,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        likes: 0,
        price: 99,
        isSponsored: false,
        isAdminPick: false,
        createdAt: new Date(),
        category,
        tld,
      };
      
      // Add to the global domains list and the local state
      window.globalDomains.push(newDomain);
      setMyDomains([newDomain, ...myDomains]);
      
      // Reset form fields
      setDomainName("");
      setDescription("");
      setExpirationDate(addDays(new Date(), 14));
      setCategory(DomainCategory.Business);
      setIsSubmitting(false);
    }, 1000);
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
            {myDomains.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDomains.map((domain) => (
                  <DomainCard key={domain.id} domain={domain} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    You haven't listed any domains yet. Use the "List a Domain" tab to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="list-domain">
            <Card>
              <CardHeader>
                <CardTitle>List Your Domain</CardTitle>
                <CardDescription>
                  Enter details about the domain you're not planning to renew
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input
                      id="domain-name"
                      placeholder="example.com"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Include the full domain name with TLD (e.g., .com, .org, .io)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as DomainCategory)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DomainCategory).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the most appropriate category for your domain
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiration-date">Expiration Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expirationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expirationDate ? format(expirationDate, "PPP") : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expirationDate}
                          onSelect={setExpirationDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-muted-foreground">
                      Domain must be expiring within 30 days
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your domain (industry, potential uses, etc.)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      All domains are listed at our fixed price of $99
                    </p>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "List Domain for Sale"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interested-buyers">
            {interestedBuyers.length > 0 ? (
              <div className="space-y-4">
                {interestedBuyers.map((buyer, index) => {
                  const domain = mockDomains.find(d => d.id === buyer.domainId);
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <p className="font-semibold">
                              {buyer.buyerName} is interested in:
                            </p>
                            <p className="text-lg font-bold mt-1">
                              {domain?.name}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <p className="text-sm">Contact them at:</p>
                            <p className="font-medium">{buyer.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    No interested buyers yet. They'll appear here when someone wants to purchase your domain.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="account">
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
                    defaultValue={currentUser.name}
                    disabled={false}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    defaultValue={currentUser.email}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Add this TypeScript interface to the global Window object
declare global {
  interface Window {
    globalDomains: Domain[];
  }
}

export default Dashboard;
