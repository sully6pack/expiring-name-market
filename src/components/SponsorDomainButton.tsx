
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Domain } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface SponsorDomainButtonProps {
  domain: Domain;
  onSuccess: () => void;
}

const SponsorDomainButton = ({ domain, onSuccess }: SponsorDomainButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show the button if the domain is already sponsored
  if (domain.isSponsored) {
    return (
      <Button variant="ghost" size="sm" className="text-green-600" disabled>
        <CheckCircle className="h-4 w-4 mr-1" /> Sponsored
      </Button>
    );
  }

  const handleSponsor = async () => {
    setIsProcessing(true);
    
    try {
      // Update the domain in Supabase to mark it as sponsored
      const { error } = await supabase
        .from('domains')
        .update({ is_sponsored: true })
        .eq('id', domain.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`${domain.name} is now sponsored and will appear in the sponsored leaderboard!`);
      setIsDialogOpen(false);
      onSuccess(); // Trigger refetch in the parent component
    } catch (error) {
      console.error("Error sponsoring domain:", error);
      toast.error("Failed to sponsor domain. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="text-amber-600 border-amber-300 hover:bg-amber-50"
        onClick={() => setIsDialogOpen(true)}
      >
        <Sparkles className="h-4 w-4 mr-1" /> Sponsor
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sponsor Your Domain</DialogTitle>
            <DialogDescription>
              For $5, your domain will be featured in the Sponsored Domains leaderboard for maximum visibility.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Domain Name:</span>
                <span className="font-medium">{domain.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sponsorship Fee:</span>
                <span className="font-medium">$5.00</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold">Total:</span>
                <span className="font-bold text-lg">$5.00</span>
              </div>
              
              <Button 
                onClick={handleSponsor} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Pay $5.00 to Sponsor"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SponsorDomainButton;
