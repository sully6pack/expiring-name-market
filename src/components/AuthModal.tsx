
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mockData";
import { login, register, requestPasswordReset } from "@/services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  onAuthenticate?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  setMode,
  onAuthenticate,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showResetPassword) {
        // Handle password reset request
        const success = await requestPasswordReset(email);
        if (success) {
          toast({
            title: "Password reset link sent",
            description: "Please check your email for password reset instructions",
          });
          setShowResetPassword(false);
        }
      } else if (mode === "login") {
        // Handle login
        const user = await login(email, password);
        if (user) {
          if (onAuthenticate) {
            onAuthenticate();
          }
        }
      } else {
        // Handle registration
        const user = await register(email, name || email.split('@')[0], password);
        if (user && onAuthenticate) {
          onAuthenticate();
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setShowResetPassword(false);
  };

  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {showResetPassword 
              ? "Reset Password" 
              : mode === "login" 
                ? "Sign In" 
                : "Create an Account"}
          </DialogTitle>
          <DialogDescription>
            {showResetPassword
              ? "Enter your email to receive password reset instructions"
              : mode === "login"
                ? "Enter your credentials to access your account"
                : "Register to list your expiring domains"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && !showResetPassword && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === "login" && !showResetPassword ? "Use admin@notrenewing.com for admin access" : ""}
              required
            />
          </div>
          {!showResetPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Use admin123 for admin access" : ""}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? "Processing..." 
              : showResetPassword 
                ? "Send Reset Link" 
                : mode === "login" 
                  ? "Sign In" 
                  : "Register"}
          </Button>
          
          {mode === "login" && !showResetPassword && (
            <Button 
              type="button" 
              variant="link" 
              className="w-full" 
              onClick={toggleResetPassword}
            >
              Forgot your password?
            </Button>
          )}
          
          {showResetPassword && (
            <Button 
              type="button" 
              variant="link" 
              className="w-full" 
              onClick={toggleResetPassword}
            >
              Back to login
            </Button>
          )}
        </form>
        <div className="text-center mt-4">
          <Button variant="link" onClick={toggleMode}>
            {mode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Sign In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
