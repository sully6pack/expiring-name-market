
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/domainUtils";
import { Domain } from "@/types";
import { stripePromise, formatPriceForStripe } from "@/utils/stripe";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

interface DomainCheckoutProps {
  domain: Domain;
  isOpen: boolean;
  onClose: () => void;
}

const DomainCheckout = ({ domain, isOpen, onClose }: DomainCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      
      // In a real application, you would make a server request to create a checkout session
      // For demo purposes, we'll simulate this with a timeout
      
      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      // Simulate creating a checkout session
      // In production, this would be an API call to your server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to checkout page
      navigate(`/checkout/${domain.id}`);
      
      toast.success("Redirecting to checkout...");
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Domain</DialogTitle>
          <DialogDescription>
            You're about to purchase {domain.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Domain Name:</span>
              <span className="font-medium">{domain.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-bold text-lg">{formatPrice(domain.price)}</span>
            </div>
            
            <hr className="my-2" />
            
            <Button 
              onClick={handleCheckout} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
              {!isProcessing && <CreditCard className="ml-2" size={16} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DomainCheckout;
