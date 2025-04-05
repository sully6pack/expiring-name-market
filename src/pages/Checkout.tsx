
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/utils/domainUtils";
import { mockDomains } from "@/lib/mockData";
import { Domain } from "@/types";
import Navbar from "@/components/Navbar";
import { isDomainPurchased } from "@/utils/purchaseUtils";
import { toast } from "sonner";
import { CreditCard, ArrowLeft } from "lucide-react";

const Checkout = () => {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { domainId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // In a real app, you'd fetch this from an API
    const foundDomain = mockDomains.find(d => d.id === domainId);
    
    if (foundDomain) {
      // Check if domain has already been purchased
      if (isDomainPurchased(foundDomain.name)) {
        toast.error("This domain has already been purchased and is no longer available.");
        navigate("/domains");
        return;
      }
      
      setDomain(foundDomain);
    } else {
      toast.error("Domain not found");
      navigate("/domains");
    }
  }, [domainId, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your payment processing endpoint
      // For demo purposes, we'll simulate a successful payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page after payment
      navigate(`/checkout/success?domain=${domain.name}`);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                You're purchasing {domain.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain Name:</span>
                  <span className="font-medium">{domain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiration Date:</span>
                  <span>{domain.expirationDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{domain.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller:</span>
                  <span>{domain.sellerName}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">{formatPrice(domain.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enter your payment details securely</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" required />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="4242 4242 4242 4242" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" required />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Complete Purchase"}
                {!isLoading && <CreditCard className="ml-2" size={16} />}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
