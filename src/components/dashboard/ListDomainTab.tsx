
import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, AlertCircle, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DomainCategory, Domain, VerificationStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DomainVerificationPanel from "./DomainVerificationPanel";

interface ListDomainTabProps {
  onSubmit: (domainData: {
    domainName: string;
    description: string;
    expirationDate: Date | undefined;
    category: DomainCategory;
  }) => void;
  isSubmitting: boolean;
}

const ListDomainTab = ({ onSubmit, isSubmitting }: ListDomainTabProps) => {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined); // Now optional
  const [category, setCategory] = useState<DomainCategory>(DomainCategory.Business);
  const [step, setStep] = useState<"details" | "verification">("details");
  const [newDomain, setNewDomain] = useState<Domain | null>(null);
  const [isValidationError, setIsValidationError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!domainName || !description || !category) {
      setIsValidationError(true);
      return;
    }
    
    setIsValidationError(false);
    
    onSubmit({
      domainName,
      description,
      expirationDate,
      category,
    });
    
    // Move to verification step
    setStep("verification");
    
    // Create a temporary domain object for verification
    // The real one will be created in the parent component
    const tempDomain: Domain = {
      id: `temp-${Math.random().toString(36).substring(7)}`,
      name: domainName,
      description,
      expirationDate: expirationDate || addDays(new Date(), 30), // Default expiration if not provided
      category,
      sellerId: "current-user", // This will be set properly in parent
      sellerName: "Current User", // This will be set properly in parent
      price: 99,
      likes: 0,
      isSponsored: false,
      isAdminPick: false,
      createdAt: new Date(),
      tld: domainName.split('.').pop() || "",
      verificationStatus: VerificationStatus.NOT_STARTED
    };
    
    setNewDomain(tempDomain);
  };
  
  const resetForm = () => {
    setDomainName("");
    setDescription("");
    setExpirationDate(undefined);
    setCategory(DomainCategory.Business);
    setStep("details");
    setNewDomain(null);
    setIsValidationError(false);
  };
  
  const handleVerificationUpdate = (updatedDomain: Domain) => {
    setNewDomain(updatedDomain);
    
    // If domain is verified, reset the form for a new submission
    if (updatedDomain.verificationStatus === VerificationStatus.VERIFIED) {
      setTimeout(() => {
        resetForm();
      }, 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>List Your Domain</CardTitle>
        <CardDescription>
          Enter details about the domain you're not planning to renew
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "details" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isValidationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Please fill in all required fields.
                </AlertDescription>
              </Alert>
            )}
            
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
              <div className="flex items-center justify-between">
                <Label htmlFor="expiration-date">Expiration Date (Optional)</Label>
                <div className="flex items-center">
                  <InfoIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">Will be fetched during verification</span>
                </div>
              </div>
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
                      <span>Pick a date (optional)</span>
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
              <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-700">
                <AlertDescription className="text-xs">
                  Expiration date will be automatically fetched during domain verification. 
                  You can provide it now if you know it, but the verified date will override this value.
                </AlertDescription>
              </Alert>
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
                {isSubmitting ? "Submitting..." : "Continue to Verification"}
              </Button>
            </div>
          </form>
        ) : newDomain ? (
          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle>Domain Details Saved</AlertTitle>
              <AlertDescription>
                Your domain details have been saved. Please complete verification to list your domain.
              </AlertDescription>
            </Alert>
            
            <DomainVerificationPanel 
              domain={newDomain} 
              onVerificationUpdate={handleVerificationUpdate}
            />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={() => resetForm()} 
                disabled={newDomain.verificationStatus !== VerificationStatus.VERIFIED}
              >
                {newDomain.verificationStatus === VerificationStatus.VERIFIED 
                  ? "Add Another Domain" 
                  : "Complete Verification"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Loading verification panel...</p>
            <Button className="mt-4" onClick={() => setStep("details")}>
              Go Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListDomainTab;
