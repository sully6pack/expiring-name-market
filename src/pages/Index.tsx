
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import QuickSearch from "@/components/home/QuickSearch";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedDomains from "@/components/home/FeaturedDomains";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import { mockDomains, getLeaderboard } from "@/lib/mockData";
import { LeaderboardType } from "@/types";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { filterOutPurchasedDomains } from "@/utils/purchaseUtils";
import { toast } from "sonner";

const Index = () => {
  const [featuredDomains, setFeaturedDomains] = useState([]);
  const [filteredFeaturedDomains, setFilteredFeaturedDomains] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [adminPicks, setAdminPicks] = useState([]);
  const [sponsored, setSponsored] = useState([]);
  const [availableTLDs, setAvailableTLDs] = useState([]);

  useEffect(() => {
    console.log("Index: Loading domains from mockDomains");
    
    const validDomains = filterValidDomains([...mockDomains]);
    const availableDomains = filterOutPurchasedDomains(validDomains);
    
    console.log("Index: Valid domains count:", availableDomains.length);
    
    setFeaturedDomains(availableDomains.slice(0, 8));
    setFilteredFeaturedDomains(availableDomains.slice(0, 8));
    
    setMostLiked(filterOutPurchasedDomains(getLeaderboard(LeaderboardType.MostLiked)).slice(0, 10));
    setAdminPicks(filterOutPurchasedDomains(getLeaderboard(LeaderboardType.AdminPicks)).slice(0, 10));
    setSponsored(filterOutPurchasedDomains(getLeaderboard(LeaderboardType.Sponsored)).slice(0, 10));
    
    setAvailableTLDs(getUniqueTLDs(availableDomains));
    
    if (availableDomains.length > 0) {
      toast.success(`Loaded ${availableDomains.length} domains`);
    } else {
      toast.error("Failed to load any domains");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <QuickSearch availableTLDs={availableTLDs} />
      <HowItWorksSection />
      <FeaturedDomains domains={filteredFeaturedDomains} />
      <LeaderboardSection mostLiked={mostLiked} adminPicks={adminPicks} sponsored={sponsored} />
      <Footer />
    </div>
  );
};

export default Index;
