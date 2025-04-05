
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { CheckCircle, Home, Search } from "lucide-react";
import { markDomainAsPurchased, logPurchasedDomains } from "@/utils/purchaseUtils";
import { toast } from "sonner";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const domainName = searchParams.get("domain");
  
  useEffect(() => {
    // If no domain name is specified, redirect to homepage
    if (!domainName) {
      navigate("/");
      return;
    }
    
    // Log current purchased domains before adding the new one
    console.log("Before purchase - checking purchased domains:");
    logPurchasedDomains();
    
    // Mark the domain as purchased
    markDomainAsPurchased(domainName);
    toast.success(`${domainName} has been successfully purchased!`);
    
    // Log purchased domains after adding
    console.log("After purchase - checking purchased domains:");
    logPurchasedDomains();
  }, [domainName, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-500 h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-center">
              You have successfully purchased <span className="font-bold">{domainName}</span>. 
              The domain seller will contact you shortly with transfer details.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <p className="text-sm text-green-800">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" /> Return to Homepage
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/domains")}
            >
              <Search className="mr-2 h-4 w-4" /> Browse More Domains
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
