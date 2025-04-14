
import { supabase } from "@/integrations/supabase/client";
import { DomainCategory } from "@/types";
import { mockDomains } from "@/lib/mockData";

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
    
    // Convert mock domains to database format
    const domainsToInsert = mockDomains.map(domain => ({
      name: domain.name,
      description: domain.description,
      expiration_date: domain.expirationDate.toISOString(),
      seller_id: adminId,
      seller_name: "Admin",
      price: domain.price,
      category: domain.category,
      tld: domain.tld,
      verification_status: "VERIFIED",
      is_verified: true,
      is_admin_pick: domain.isAdminPick,
      is_sponsored: domain.isSponsored,
      likes: domain.likes
    }));
    
    // Insert in batches of 10 to avoid hitting any size limits
    for (let i = 0; i < domainsToInsert.length; i += 10) {
      const batch = domainsToInsert.slice(i, i + 10);
      
      const { error: insertError } = await supabase
        .from('domains')
        .insert(batch);
        
      if (insertError) {
        console.error(`Error seeding domains batch ${i/10 + 1}:`, insertError);
      } else {
        console.log(`Successfully seeded batch ${i/10 + 1} (${batch.length} domains)`);
      }
    }
    
    console.log(`Successfully seeded ${domainsToInsert.length} domains from mockData`);
  } catch (error) {
    console.error("Error in seedInitialDomains:", error);
  }
};
