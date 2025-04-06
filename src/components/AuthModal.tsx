
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
import { toast } from "sonner";
import { login, register, requestPasswordReset } from "@/services/supabaseAuthService";

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (showResetPassword) {
        // Handle password reset request
        if (!email) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        
        console.log("Requesting password reset for:", email);
        const success = await requestPasswordReset(email);
        if (success) {
          toast("Password reset link sent", {
            description: "Please check your email for password reset instructions"
          });
          setShowResetPassword(false);
        }
      } else if (mode === "login") {
        // Handle login with validation
        if (!email || !password) {
          setError("Email and password are required");
          setLoading(false);
          return;
        }
        
        console.log("Attempting to log in user:", email);
        // Handle login
        const user = await login(email, password);
        if (user) {
          console.log("Login successful, calling onAuthenticate");
          // Only call onAuthenticate if user is successfully logged in
          if (onAuthenticate) {
            onAuthenticate();
          }
        } else {
          console.log("Login failed, not calling onAuthenticate");
          // Error toasts are handled in the login function
        }
      } else {
        // Handle registration with validation
        if (!email || !password) {
          setError("Email and password are required");
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        
        console.log("Attempting to register user:", email);
        // Handle registration
        const user = await register(email, name || email.split('@')[0], password);
        if (user) {
          console.log("Registration successful, calling onAuthenticate");
          if (onAuthenticate) {
            onAuthenticate();
          }
        } else {
          console.log("Registration failed");
          setError("Registration failed. Email might already be in use.");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Authentication failed. Please try again.");
      toast("Authentication failed", {
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
    setError(null);
  };

  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
    setError(null);
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
                required
              />
            </div>
          )}
          
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
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
