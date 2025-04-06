
import React from "react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">{title}</h1>
        {description && (
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            {description}
          </p>
        )}
        
        {children}
      </div>
      
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">NotRenewing.com</h2>
              <p className="max-w-md">
                The marketplace for soon-to-expire domain names.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:underline">Home</Link></li>
                  <li><Link to="/domains" className="hover:underline">Browse Domains</Link></li>
                  <li><Link to="/dashboard" className="hover:underline">My Account</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/how-it-works" className="hover:underline">How It Works</Link></li>
                  <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
                  <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} NotRenewing.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
