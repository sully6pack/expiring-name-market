
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import { getCurrentUser, logout } from "@/services/authService";
import { User } from "@/types";
import { toast } from "sonner";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);

  // Load current user on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    toast.success("Signed out successfully");
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    const currentUser = getCurrentUser();
    setUser(currentUser);
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
          {user ? (
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
