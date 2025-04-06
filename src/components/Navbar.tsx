
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import { getCurrentUser, logout } from "@/services/supabaseAuthService";
import { User } from "@/types";
import { toast } from "sonner";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        console.log("Navbar: Fetching current user on mount");
        
        // Try to get user from Supabase first
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log("Navbar: Current user from getCurrentUser:", currentUser);
          setUser(currentUser);
        } else {
          // If no Supabase user, check for mock admin user in localStorage
          const storedUser = localStorage.getItem("currentUser");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("Navbar: Found stored user:", parsedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error("Navbar: Error parsing stored user:", error);
            }
          }
        }
      } catch (error) {
        console.error("Navbar: Error fetching user:", error);
        toast.error("Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("Navbar: Attempting to sign out");
      
      // Check if we're using the mock admin user
      if (user?.email === "admin@notrenewing.com") {
        // Use the mock logout
        await import("@/services/authService").then(module => module.logout());
        console.log("Navbar: Admin signed out via mock auth");
      } else {
        // Use Supabase logout
        await logout();
      }
      
      setUser(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Navbar: Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    try {
      console.log("Navbar: Auth success - fetching updated user");
      
      // Try Supabase first
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log("Navbar: Updated current user from Supabase:", currentUser);
        setUser(currentUser);
      } else {
        // Check for mock admin user
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Navbar: Found stored user after auth:", parsedUser);
            setUser(parsedUser);
            
            // Display admin logged in message
            if (parsedUser.isAdmin) {
              toast.success(`Welcome Admin ${parsedUser.name || parsedUser.email}!`);
            }
          } catch (error) {
            console.error("Navbar: Error parsing stored user after auth:", error);
          }
        }
      }
    } catch (error) {
      console.error("Navbar: Error fetching user after auth:", error);
    }
  };

  const openLoginModal = () => {
    setModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-blue">
            NotRenewing.com
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-brand-blue transition-colors"
          >
            Home
          </Link>
          <Link
            to="/domains"
            className="text-gray-600 hover:text-brand-blue transition-colors"
          >
            Browse Domains
          </Link>
          <Link
            to="/how-it-works"
            className="text-gray-600 hover:text-brand-blue transition-colors"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Button variant="outline" disabled>Loading...</Button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              {user.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              <Button onClick={handleSignOut} variant="ghost">
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button onClick={openLoginModal} variant="ghost">
                Sign In
              </Button>
              <Button onClick={openRegisterModal} variant="default">
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={modalMode}
        setMode={setModalMode}
        onAuthenticate={handleAuthSuccess}
      />
    </header>
  );
};

export default Navbar;
