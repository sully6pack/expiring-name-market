
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { verifyDomainWithCode } from "@/services/domainVerificationService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyDomain = () => {
  const { domainId } = useParams();
  const [searchParams] = useSearchParams();
  const [verificationResult, setVerificationResult] = useState<"success" | "failure" | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState(searchParams.get("code") || "");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If code is provided in URL, try to verify immediately
    const codeFromUrl = searchParams.get("code");
    if (domainId && codeFromUrl) {
      handleVerification(codeFromUrl);
    }
  }, []);

  const handleVerification = async (verificationCode: string) => {
    if (!domainId) {
      toast({
        title: "Verification Error",
        description: "Missing domain information. Please try again.",
        variant: "destructive",
      });
      setVerificationResult("failure");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyDomainWithCode(domainId, verificationCode);
      
      if (result) {
        setVerificationResult("success");
        toast({
          title: "Domain Verified",
          description: "Your domain has been successfully verified.",
        });
      } else {
        setVerificationResult("failure");
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your domain with the provided code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setVerificationResult("failure");
      toast({
        title: "Verification Error",
        description: "An error occurred during the verification process.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = () => {
    handleVerification(code);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Domain Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationResult === "success" ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold">Verification Successful</h2>
              <p className="text-gray-600">
                Your domain has been successfully verified. You can now list it for sale.
              </p>
            </div>
          ) : verificationResult === "failure" ? (
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">Verification Failed</h2>
              <p className="text-gray-600">
                We couldn't verify your domain. Please check the verification code and try again.
              </p>
              
              <div className="pt-4 space-y-2">
                <p className="text-sm font-medium">Verification Code</p>
                <InputOTP 
                  maxLength={8} 
                  value={code} 
                  onChange={setCode}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600">
                Please enter the verification code that was sent to your email address.
              </p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Verification Code</p>
                <InputOTP 
                  maxLength={8} 
                  value={code} 
                  onChange={setCode}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          {verificationResult === "success" ? (
            <Button
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          ) : verificationResult === "failure" ? (
            <Button
              className="w-full"
              onClick={handleManualVerification}
              disabled={isVerifying || code.length < 8}
            >
              Try Again
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleManualVerification}
              disabled={isVerifying || code.length < 8}
            >
              {isVerifying ? "Verifying..." : "Verify Domain"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyDomain;
