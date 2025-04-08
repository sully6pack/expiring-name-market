
import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, AlertCircle, InfoIcon, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DomainCategory, Domain, VerificationStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { verifyDomain, fetchDomainExpirationDate } from "@/services/domainVerification";

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
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<DomainCategory>(DomainCategory.Business);
  const [isValidationError, setIsValidationError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const { toast } = useToast();

  const validateDomain = async () => {
    if (!domainName) {
      setIsValidationError(true);
      setVerificationMessage("Please enter a domain name");
      return false;
    }

    setIsVerifying(true);
    setVerificationStatus("verifying");
    
    try {
      // First verify the domain exists
      const isValid = await verifyDomain(domainName);
      
      if (!isValid) {
        setVerificationStatus("error");
        setVerificationMessage("Could not verify this domain. Please check the domain name and try again.");
        return false;
      }
      
      // If domain exists, try to fetch its expiration date
      const domainExpirationDate = await fetchDomainExpirationDate(domainName);
      
      if (domainExpirationDate) {
        setExpirationDate(domainExpirationDate);
        toast({
          title: "Domain Verified",
          description: `Expiration date found: ${format(domainExpirationDate, "PP")}`,
        });
      } else {
        toast({
          title: "Domain Verified",
          description: "Domain exists but expiration date could not be determined.",
        });
      }
      
      setVerificationStatus("success");
      setVerificationMessage("Domain verified successfully!");
      return true;
      
    } catch (error) {
      console.error("Error validating domain:", error);
      setVerificationStatus("error");
      setVerificationMessage("An error occurred while verifying the domain.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!domainName || !description || !category) {
      setIsValidationError(true);
      return;
    }
    
    setIsValidationError(false);
    
    // Only proceed if the domain has been verified
    if (verificationStatus !== "success") {
      const verified = await validateDomain();
      if (!verified) return;
    }
    
    onSubmit({
      domainName,
      description,
      expirationDate,
      category,
    });
    
    // Reset form after successful submission
    resetForm();
  };
  
  const resetForm = () => {
    setDomainName("");
    setDescription("");
    setExpirationDate(undefined);
    setCategory(DomainCategory.Business);
    setIsValidationError(false);
    setVerificationStatus("idle");
    setVerificationMessage("");
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
            <div className="flex space-x-2">
              <Input
                id="domain-name"
                placeholder="example.com"
                value={domainName}
                onChange={(e) => {
                  setDomainName(e.target.value);
                  if (verificationStatus !== "idle") {
                    setVerificationStatus("idle");
                  }
                }}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={validateDomain}
                disabled={isVerifying || !domainName || verificationStatus === "success"}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying
                  </>
                ) : verificationStatus === "success" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Verified
                  </>
                ) : (
                  "Verify Domain"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Include the full domain name with TLD (e.g., .com, .org, .io)
            </p>
            
            {verificationStatus === "error" && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{verificationMessage}</AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === "success" && (
              <Alert className="mt-2 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Domain Verified</AlertTitle>
                <AlertDescription>{verificationMessage}</AlertDescription>
              </Alert>
            )}
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
              <Label htmlFor="expiration-date">Expiration Date</Label>
              {expirationDate && (
                <div className="flex items-center">
                  <InfoIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">Fetched from WHOIS data</span>
                </div>
              )}
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
                    <span>Select a date</span>
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
              disabled={isSubmitting || verificationStatus === "verifying" || (verificationStatus !== "success" && domainName.length > 0)}
            >
              {isSubmitting ? "Submitting..." : "List Domain"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ListDomainTab;
