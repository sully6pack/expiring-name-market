
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import QuickSearch from "@/components/home/QuickSearch";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedDomains from "@/components/home/FeaturedDomains";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import { Domain, LeaderboardType, DomainCategory, VerificationStatus } from "@/types";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { seedInitialDomains } from "@/services/seedDomains";

const Index = () => {
  const [featuredDomains, setFeaturedDomains] = useState<Domain[]>([]);
  const [mostLiked, setMostLiked] = useState<Domain[]>([]);
  const [adminPicks, setAdminPicks] = useState<Domain[]>([]);
  const [sponsored, setSponsored] = useState<Domain[]>([]);
  const [availableTLDs, setAvailableTLDs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDomains = async () => {
      setIsLoading(true);
      
      try {
        // Seed domains if needed
        await seedInitialDomains();
        
        // Get all available domains that are verified and not purchased
        const { data, error } = await supabase
          .from('domains')
          .select('*')
          .eq('is_verified', true)
          .is('buyer_id', null)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching domains:", error);
          toast.error("Failed to load domains");
          setIsLoading(false);
          return;
        }
        
        // Convert database format to app format with proper enum conversion
        const formattedDomains: Domain[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          expirationDate: new Date(item.expiration_date),
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          likes: item.likes || 0,
          price: item.price,
          isSponsored: item.is_sponsored || false,
          isAdminPick: item.is_admin_pick || false,
          createdAt: new Date(item.created_at),
          // Convert string category to DomainCategory enum
          category: validateDomainCategory(item.category),
          tld: item.tld,
          verificationStatus: validateVerificationStatus(item.verification_status),
          isVerified: item.is_verified || false
        }));
        
        const validDomains = filterValidDomains(formattedDomains);
        
        setFeaturedDomains(validDomains.slice(0, 8));
        setMostLiked(validDomains.sort((a, b) => b.likes - a.likes).slice(0, 10));
        setAdminPicks(validDomains.filter(d => d.isAdminPick).slice(0, 10));
        setSponsored(validDomains.filter(d => d.isSponsored).slice(0, 10));
        
        setAvailableTLDs(getUniqueTLDs(validDomains));
        
        if (validDomains.length > 0) {
          toast.success(`Loaded ${validDomains.length} domains`);
        } else {
          toast.info("No domains available at the moment");
        }
      } catch (error) {
        console.error("Error loading domains:", error);
        toast.error("An unexpected error occurred while loading domains");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDomains();
  }, []);

  // Helper function to validate and convert category string to DomainCategory enum
  const validateDomainCategory = (category: string): DomainCategory => {
    if (Object.values(DomainCategory).includes(category as DomainCategory)) {
      return category as DomainCategory;
    }
    return DomainCategory.Other; // Default to "Other" if category is not valid
  };

  // Helper function to validate and convert verification status string to VerificationStatus enum
  const validateVerificationStatus = (status: string): VerificationStatus => {
    if (Object.values(VerificationStatus).includes(status as VerificationStatus)) {
      return status as VerificationStatus;
    }
    return VerificationStatus.NOT_STARTED; // Default if not valid
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <QuickSearch availableTLDs={availableTLDs} />
      <HowItWorksSection />
      <FeaturedDomains domains={featuredDomains} isLoading={isLoading} />
      <LeaderboardSection mostLiked={mostLiked} adminPicks={adminPicks} sponsored={sponsored} />
      <Footer />
    </div>
  );
};

export default Index;
