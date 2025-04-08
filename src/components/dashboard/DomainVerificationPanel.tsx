import React, { useState, useEffect } from "react";
import { Domain, VerificationMethod, VerificationStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Clock, HelpCircle, Calendar } from "lucide-react";
import { 
  getVerificationInstructions, 
  checkDnsTxtVerification, 
  startEmailVerification, 
  simulateVerificationTimeout 
} from "@/services/domainVerificationService";
import { getCurrentUser } from "@/services/authService";
import { updateDomain } from "@/services/domainService";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { convertDbDomainToDomain } from "@/lib/supabase";
import { generateVerificationCode } from "@/services/domainVerificationService";

interface DomainVerificationPanelProps {
  domain: Domain;
  onVerificationUpdate?: (updated: Domain) => void;
}

const DomainVerificationPanel = ({ domain, onVerificationUpdate }: DomainVerificationPanelProps) => {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>(
    domain.verificationMethod || VerificationMethod.DNS_TXT
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [instructions, setInstructions] = useState(
    getVerificationInstructions(domain, selectedMethod)
  );
  const [verificationStartTime, setVerificationStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const user = getCurrentUser();
  
  // Poll for updates if verification is pending
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (domain.verificationStatus === VerificationStatus.PENDING) {
      // Set the start time if it's not already set
      if (!verificationStartTime) {
        setVerificationStartTime(new Date());
      }
      
      // Poll every 1 second for updates (reduced from 3s to be more responsive)
      intervalId = setInterval(async () => {
        // Get the latest domain data from Supabase
        try {
          const { data: updatedDomainData, error } = await supabase
            .from('domains')
            .select('*')
            .eq('id', domain.id)
            .single();
          
          if (error) {
            console.error("Error fetching domain update:", error);
            return;
          }
          
          if (!updatedDomainData) {
            console.error("No domain data returned");
            return;
          }
          
          const updatedDomain = convertDbDomainToDomain(updatedDomainData);
          
          if (updatedDomain.verificationStatus !== VerificationStatus.PENDING) {
            // Verification has completed (either success or failure)
            clearInterval(intervalId);
            setIsVerifying(false);
            
            if (onVerificationUpdate) {
              onVerificationUpdate(updatedDomain);
            }
            
            // Show toast based on verification result
            if (updatedDomain.verificationStatus === VerificationStatus.VERIFIED) {
              toast({
                title: "Verification Successful",
                description: "Your domain has been successfully verified.",
                variant: "default",
              });
            } else if (updatedDomain.verificationStatus === VerificationStatus.FAILED) {
              toast({
                title: "Verification Failed",
                description: updatedDomain.verificationNotes || "Domain verification failed. Please try again.",
                variant: "destructive",
              });
            }
          }
        } catch (err) {
          console.error("Error in polling interval:", err);
        }
        
        // Check if verification has been running too long (over 15 seconds)
        const now = new Date();
        const elapsedTimeMs = verificationStartTime ? now.getTime() - verificationStartTime.getTime() : 0;
        
        if (elapsedTimeMs > 15000) {
          // It's been too long, cancel the interval
          clearInterval(intervalId);
          setIsVerifying(false);
          
          // Update domain status to failed due to timeout
          const timeoutDomain: Domain = {
            ...domain,
            verificationStatus: VerificationStatus.FAILED,
            verificationDate: new Date(),
            verificationNotes: "Verification timed out. Please try again."
          };
          
          updateDomain(timeoutDomain);
          
          if (onVerificationUpdate) {
            onVerificationUpdate(timeoutDomain);
          }
          
          toast({
            title: "Verification Timeout",
            description: "Verification is taking too long. Please try again later.",
            variant: "destructive",
          });
        }
      }, 1000);
    }
    
    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [domain.id, domain.verificationStatus, onVerificationUpdate, verificationStartTime, toast]);
  
  const getStatusIcon = () => {
    switch (domain.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case VerificationStatus.FAILED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case VerificationStatus.PENDING:
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusText = () => {
    switch (domain.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return "Verified";
      case VerificationStatus.FAILED:
        return "Verification Failed";
      case VerificationStatus.PENDING:
        return "Verification Pending";
      default:
        return "Not Verified";
    }
  };
  
  const getStatusClass = () => {
    switch (domain.verificationStatus) {
      case VerificationStatus.VERIFIED:
        return "bg-green-50 text-green-700 border-green-200";
      case VerificationStatus.FAILED:
        return "bg-red-50 text-red-700 border-red-200";
      case VerificationStatus.PENDING:
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const handleMethodChange = (value: string) => {
    const method = value as VerificationMethod;
    setSelectedMethod(method);
    
    // Generate new instructions based on selected method
    const newInstructions = getVerificationInstructions(domain, method);
    setInstructions(newInstructions);
    console.log("Updated verification method to:", method, "with instructions:", newInstructions);
    
    // Update domain with the new method and generate a new verification code
    const verificationCode = generateVerificationCode();
    console.log("Generated new verification code:", verificationCode);
    
    const updatedDomain: Domain = {
      ...domain,
      verificationMethod: method,
      verificationCode: verificationCode
    };
    
    // Update the domain in Supabase
    const { error } = supabase
      .from('domains')
      .update({
        verification_method: method,
        verification_code: verificationCode
      })
      .eq('id', domain.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating domain verification method:", error);
          toast({
            title: "Update Error",
            description: "Could not update verification method. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Domain verification method updated successfully");
          if (onVerificationUpdate) {
            onVerificationUpdate(updatedDomain);
          }
        }
      });
  };
  
  const startVerification = async () => {
    if (!user || !domain) return;
    
    setIsVerifying(true);
    setVerificationStartTime(new Date());
    
    try {
      console.log("Starting verification process with method:", selectedMethod);
      
      // Set domain to pending status
      const pendingDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.PENDING,
        verificationMethod: selectedMethod
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('domains')
        .update({
          verification_status: VerificationStatus.PENDING,
          verification_method: selectedMethod
        })
        .eq('id', domain.id);
      
      if (error) {
        throw new Error(`Error updating domain status: ${error.message}`);
      }
      
      if (onVerificationUpdate) {
        onVerificationUpdate(pendingDomain);
      }
      
      // Show toast that verification has started
      toast({
        title: "Verification Started",
        description: "We're now verifying your domain ownership. This may take a few moments.",
      });
      
      if (selectedMethod === VerificationMethod.DNS_TXT) {
        console.log("Starting DNS TXT verification for domain:", domain.name);
        await checkDnsTxtVerification(pendingDomain);
      } else if (selectedMethod === VerificationMethod.WHOIS_EMAIL) {
        console.log("Starting email verification for domain:", domain.name);
        await startEmailVerification(pendingDomain, user.email);
      } else if (selectedMethod === VerificationMethod.DNS_CNAME) {
        console.log("Starting CNAME verification for domain:", domain.name);
        // Implement CNAME verification here
        toast({
          title: "Verification Method",
          description: "CNAME verification requested. Please add the CNAME record as instructed.",
        });
        
        // Update domain with status explaining CNAME verification
        const pendingCnameDomain: Domain = {
          ...domain,
          verificationStatus: VerificationStatus.PENDING,
          verificationMethod: VerificationMethod.DNS_CNAME,
          verificationNotes: "Please add the CNAME record and wait for verification."
        };
        
        await supabase
          .from('domains')
          .update({
            verification_status: VerificationStatus.PENDING,
            verification_method: VerificationMethod.DNS_CNAME,
            verification_notes: "Please add the CNAME record and wait for verification."
          })
          .eq('id', domain.id);
        
        if (onVerificationUpdate) {
          onVerificationUpdate(pendingCnameDomain);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setIsVerifying(false);
      
      // Update domain status to failed due to error
      const errorDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "Verification failed with an error. Please try again."
      };
      
      await supabase
        .from('domains')
        .update({
          verification_status: VerificationStatus.FAILED,
          verification_date: new Date().toISOString(),
          verification_notes: "Verification failed with an error. Please try again."
        })
        .eq('id', domain.id);
      
      if (onVerificationUpdate) {
        onVerificationUpdate(errorDomain);
      }
      
      // Show error toast
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isStartButtonDisabled = 
    domain.verificationStatus === VerificationStatus.VERIFIED ||
    domain.verificationStatus === VerificationStatus.PENDING ||
    isVerifying;
  
  const handleRetryVerification = () => {
    // Reset verification status and let user try again
    const resetDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.NOT_STARTED,
      verificationDate: undefined,
      verificationNotes: undefined
    };
    
    updateDomain(resetDomain);
    
    if (onVerificationUpdate) {
      onVerificationUpdate(resetDomain);
    }
    
    setIsVerifying(false);
    setVerificationStartTime(null);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Domain Verification</CardTitle>
            <CardDescription>
              Verify ownership of {domain.name}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full border ${getStatusClass()} flex items-center space-x-1`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {domain.verificationStatus === VerificationStatus.VERIFIED ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Domain Verified</AlertTitle>
            <AlertDescription>
              Your domain has been successfully verified.
              {domain.verificationDate && (
                <p className="mt-2 text-sm text-green-700">
                  Verified on {new Date(domain.verificationDate).toLocaleDateString()}
                </p>
              )}
              {domain.expirationDate && (
                <div className="mt-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-700" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Expiration: {format(new Date(domain.expirationDate), 'MMM d, yyyy')}
                  </Badge>
                  <span className="text-sm text-green-700">(fetched during verification)</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ) : domain.verificationStatus === VerificationStatus.FAILED ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {domain.verificationNotes || 
                "We couldn't verify your ownership of this domain. Please try again with a different method."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="verification-method" className="block text-sm font-medium">
                Verification Method
              </label>
              <Select
                value={selectedMethod}
                onValueChange={handleMethodChange}
                disabled={domain.verificationStatus === VerificationStatus.PENDING}
              >
                <SelectTrigger id="verification-method">
                  <SelectValue placeholder="Select a verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VerificationMethod.DNS_TXT}>TXT Record</SelectItem>
                  <SelectItem value={VerificationMethod.DNS_CNAME}>CNAME Record</SelectItem>
                  <SelectItem value={VerificationMethod.WHOIS_EMAIL}>Email Verification</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose how you want to verify that you own this domain
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-sm whitespace-pre-line">{instructions}</p>
            </div>
            
            {domain.verificationStatus === VerificationStatus.PENDING && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Verification in Progress</AlertTitle>
                <AlertDescription>
                  We're verifying your domain ownership. This process typically takes 5-15 seconds.
                  {verificationStartTime && (
                    <div className="mt-2 text-sm">
                      Started: {verificationStartTime.toLocaleTimeString()}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {domain.verificationStatus === VerificationStatus.VERIFIED ? (
          <p className="text-sm text-green-600 w-full text-center">Your domain is verified and ready to be listed!</p>
        ) : domain.verificationStatus === VerificationStatus.FAILED ? (
          <Button 
            onClick={handleRetryVerification}
            className="w-full"
          >
            Try Again
          </Button>
        ) : (
          <Button 
            onClick={startVerification}
            disabled={isStartButtonDisabled}
            className="w-full"
          >
            {isVerifying 
              ? "Verifying..." 
              : domain.verificationStatus === VerificationStatus.PENDING 
                ? "Verification Pending" 
                : "Start Verification"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DomainVerificationPanel;
