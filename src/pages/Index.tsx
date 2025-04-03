
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DomainCard from "@/components/DomainCard";
import Leaderboard from "@/components/Leaderboard";
import Navbar from "@/components/Navbar";
import { getLeaderboard, mockDomains } from "@/lib/mockData";
import { LeaderboardType, Domain } from "@/types";

const Index = () => {
  const [featuredDomains, setFeaturedDomains] = useState<Domain[]>([]);
  const [mostLiked, setMostLiked] = useState<Domain[]>([]);
  const [adminPicks, setAdminPicks] = useState<Domain[]>([]);
  const [sponsored, setSponsored] = useState<Domain[]>([]);

  useEffect(() => {
    // In a real app, these would be API calls
    setFeaturedDomains(mockDomains.slice(0, 4));
    setMostLiked(getLeaderboard(LeaderboardType.MostLiked).slice(0, 3));
    setAdminPicks(getLeaderboard(LeaderboardType.AdminPicks).slice(0, 3));
    setSponsored(getLeaderboard(LeaderboardType.Sponsored).slice(0, 3));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Domain Before It Expires
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Discover soon-to-expire domains at a fixed price of $99. No bidding, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/domains">
              <Button size="lg" variant="default" className="bg-white text-brand-blue hover:bg-gray-100">
                Browse Domains
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue">
                List Your Domain
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-2">List Your Domain</h3>
                <p>Register, verify your account, and list your soon-to-expire domain.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-2">Connect with Buyers</h3>
                <p>Interested buyers will express interest in your domain.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-2">Complete the Sale</h3>
                <p>Finalize the sale directly with the buyer for $99.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Domains */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/domains">
              <Button variant="outline">View All Domains</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Domain Leaderboards</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Leaderboard 
              title="Most Popular" 
              type={LeaderboardType.MostLiked} 
              domains={mostLiked} 
            />
            <Leaderboard 
              title="Staff Picks" 
              type={LeaderboardType.AdminPicks} 
              domains={adminPicks} 
            />
            <Leaderboard 
              title="Sponsored" 
              type={LeaderboardType.Sponsored} 
              domains={sponsored} 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
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

export default Index;
