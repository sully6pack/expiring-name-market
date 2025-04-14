
import { supabase } from "@/integrations/supabase/client";
import { DomainCategory } from "@/types";

// Function to seed initial domains for demonstration
export const seedInitialDomains = async () => {
  try {
    // Check if we already have domains
    const { count, error: countError } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error checking domains count:", countError);
      return;
    }
    
    // Only seed if we have no domains
    if (count && count > 0) {
      console.log(`Database already has ${count} domains, skipping seed`);
      return;
    }
    
    console.log("Seeding initial domains...");
    
    // Get the admin user to associate with these domains
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single();
    
    if (adminError) {
      console.error("Error finding admin user:", adminError);
      return;
    }
    
    const adminId = adminData.id;
    const exampleDomains = [
      {
        name: "example.com",
        description: "Premium generic domain suitable for any business.",
        expiration_date: new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)).toISOString(), // 60 days from now
        seller_id: adminId,
        seller_name: "Admin",
        price: 99.00,
        category: DomainCategory.Business,
        tld: "com",
        verification_status: "VERIFIED",
        is_verified: true,
        is_admin_pick: true
      },
      {
        name: "bestpizza.io",
        description: "Perfect domain for a pizza restaurant or delivery service.",
        expiration_date: new Date(Date.now() + (45 * 24 * 60 * 60 * 1000)).toISOString(), // 45 days from now
        seller_id: adminId,
        seller_name: "Admin",
        price: 99.00,
        category: DomainCategory.Food,
        tld: "io",
        verification_status: "VERIFIED",
        is_verified: true,
        is_sponsored: true
      },
      {
        name: "techstart.ai",
        description: "Modern domain for AI and tech startups.",
        expiration_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days from now
        seller_id: adminId,
        seller_name: "Admin",
        price: 99.00,
        category: DomainCategory.Technology,
        tld: "ai",
        verification_status: "VERIFIED",
        is_verified: true
      },
      {
        name: "greenearth.org",
        description: "Ideal for environmental organizations and non-profits.",
        expiration_date: new Date(Date.now() + (75 * 24 * 60 * 60 * 1000)).toISOString(), // 75 days from now
        seller_id: adminId,
        seller_name: "Admin",
        price: 99.00,
        category: DomainCategory.Other, // Changed from Environmental to Other as Environmental doesn't exist in the enum
        tld: "org",
        verification_status: "VERIFIED",
        is_verified: true
      },
      {
        name: "cryptotrader.finance",
        description: "Perfect domain for cryptocurrency and trading platforms.",
        expiration_date: new Date(Date.now() + (50 * 24 * 60 * 60 * 1000)).toISOString(), // 50 days from now
        seller_id: adminId,
        seller_name: "Admin",
        price: 99.00,
        category: DomainCategory.Finance,
        tld: "finance",
        verification_status: "VERIFIED",
        is_verified: true
      }
    ];
    
    const { error: insertError } = await supabase
      .from('domains')
      .insert(exampleDomains);
      
    if (insertError) {
      console.error("Error seeding domains:", insertError);
      return;
    }
    
    console.log(`Successfully seeded ${exampleDomains.length} domains`);
  } catch (error) {
    console.error("Error in seedInitialDomains:", error);
  }
};
