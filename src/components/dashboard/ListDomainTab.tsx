import { useState } from "react";
import { format } from "date-fns";
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
import { isValidDomainName } from "@/utils/validation";

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
  const [validationMessage, setValidationMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [expirationSource, setExpirationSource] = useState<"user" | "whois" | null>(null);
  const { toast } = useToast();

  const validateDomain = async () => {
    if (!domainName) {
      setIsValidationError(true);
      setValidationMessage("Please enter a domain name");
      setVerificationMessage("Please enter a domain name");
      setVerificationStatus("error");
      return false;
    }

    // Basic format validation
    if (!isValidDomainName(domainName)) {
      setIsValidationError(true);
      setValidationMessage("Please enter a valid domain name format (e.g., example.com)");
      setVerificationMessage("Invalid domain format");
      setVerificationStatus("error");
      return false;
    }

    setIsVerifying(true);
    setVerificationStatus("verifying");
    setVerificationMessage("Verifying domain...");
    
    try {
      console.log("Starting domain verification process for:", domainName);
      
      // First verify the domain exists
      const result = await verifyDomain(domainName);
      
      // Log the full verification result for debugging
      console.log("Domain verification complete:", result);
      
      if (!result || !result.isValid) {
        console.error("Domain verification failed for:", domainName, result);
        let errorMessage = "Could not verify this domain.";
        
        if (result && result.reason) {
          switch (result.reason) {
            case "domain_not_found":
              errorMessage = "This domain does not appear to be registered.";
              break;
            case "invalid_format":
              errorMessage = "Invalid domain format. Please use format like 'example.com'.";
              break;
            case "unsupported_tld":
              errorMessage = "Unsupported top-level domain. We support common TLDs like .com, .org, etc.";
              break;
            case "domain_too_short":
              errorMessage = "Domain name is too short. It must be at least 3 characters.";
              break;
            case "verification_failed":
              errorMessage = "Domain verification failed. Please try again or use a different domain.";
              break;
            case "api_error":
              errorMessage = "Error connecting to verification service. Please try again later.";
              break;
            case "invalid_api_response":
              errorMessage = "Invalid response from verification service. Please try again.";
              break;
            case "unexpected_error":
              errorMessage = "An unexpected error occurred. Please try again.";
              break;
            default:
              errorMessage = `Domain verification failed: ${result.reason || "Unknown error"}`;
          }
        }
        
        setVerificationStatus("error");
        setVerificationMessage(errorMessage);
        return false;
      }
      
      console.log("Domain verification successful for:", domainName);
      
      // If domain exists, try to fetch its expiration date
      const domainExpirationDate = await fetchDomainExpirationDate(domainName);
      
      if (domainExpirationDate) {
        console.log("Expiration date found:", domainExpirationDate);
        setExpirationDate(domainExpirationDate);
        setExpirationSource("whois");
        toast({
          title: "Domain Verified",
          description: `Expiration date found: ${format(domainExpirationDate, "PP")}`,
        });
      } else {
        console.log("No expiration date found, using default");
        // Set a default expiration date 3 months from now
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        setExpirationDate(defaultDate);
        setExpirationSource("user");
        
        toast({
          title: "Domain Verified",
          description: "Domain exists but expiration date could not be determined. A default date has been set.",
        });
      }
      
      setVerificationStatus("success");
      setVerificationMessage("Domain verified successfully!");
      return true;
      
    } catch (error) {
      console.error("Error validating domain:", error);
      setVerificationStatus("error");
      setVerificationMessage("An error occurred while verifying the domain. Please try again.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!domainName) {
      setIsValidationError(true);
      setValidationMessage("Please enter a domain name");
      return;
    }
    
    if (!description) {
      setIsValidationError(true);
      setValidationMessage("Please enter a description");
      return;
    }

    if (!isValidDomainName(domainName)) {
      setIsValidationError(true);
      setValidationMessage("Please enter a valid domain name format");
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
    setValidationMessage("");
    setVerificationStatus("idle");
    setVerificationMessage("");
    setExpirationSource(null);
  };

  const handleExpirationDateChange = (date: Date | undefined) => {
    setExpirationDate(date);
    setExpirationSource("user");
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
                {validationMessage || "Please fill in all required fields correctly."}
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
                    setExpirationSource(null);
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
              {expirationSource === "whois" && expirationDate && (
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
                  onSelect={handleExpirationDateChange}
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
