
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the WhoisXML API key from environment variable
const WHOISXML_API_KEY = Deno.env.get("WHOISXML_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, domain } = await req.json();

    // Validate required parameters
    if (!action || !domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if API key is configured
    if (!WHOISXML_API_KEY) {
      console.error("WhoisXML API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Processing ${action} request for domain: ${domain}`);

    // Handle different actions
    switch (action) {
      case "getExpirationDate":
        return await getExpirationDate(domain);
      case "getWhoisEmail":
        return await getWhoisEmail(domain);
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Get domain expiration date
async function getExpirationDate(domain: string) {
  try {
    console.log(`Fetching expiration date for ${domain}`);
    
    if (!WHOISXML_API_KEY) {
      throw new Error("WhoisXML API key not configured");
    }
    
    const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Received WhoisXML response for ${domain}`);
    
    // Extract expiration date from the response
    const whoisRecord = data.WhoisRecord || {};
    const registryData = whoisRecord.registryData || {};
    
    let expirationDate = null;
    
    // Try different possible paths to get the expiration date
    if (registryData.expiresDate) {
      expirationDate = registryData.expiresDate;
    } else if (whoisRecord.expiresDate) {
      expirationDate = whoisRecord.expiresDate;
    } else if (registryData.registryExpiryDate) {
      expirationDate = registryData.registryExpiryDate;
    } else if (whoisRecord.registryExpiryDate) {
      expirationDate = whoisRecord.registryExpiryDate;
    }
    
    console.log(`Extracted expiration date for ${domain}: ${expirationDate}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error fetching expiration date for ${domain}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

// Get WHOIS email address for domain
async function getWhoisEmail(domain: string) {
  try {
    console.log(`Fetching WHOIS email for ${domain}`);
    
    if (!WHOISXML_API_KEY) {
      throw new Error("WhoisXML API key not configured");
    }
    
    const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Received WhoisXML response for ${domain}`);
    
    const whoisRecord = data.WhoisRecord || {};
    const contactEmail = whoisRecord.contactEmail || 
                        (whoisRecord.registrant && whoisRecord.registrant.email) ||
                        (whoisRecord.administrativeContact && whoisRecord.administrativeContact.email) ||
                        null;
    
    console.log(`Extracted contact email for ${domain}: ${contactEmail}`);
    
    return new Response(
      JSON.stringify({ success: true, email: contactEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error fetching WHOIS email for ${domain}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
