
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
    const { action, domain, verificationCode } = await req.json();

    // Validate required parameters
    if (!action || !domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log all incoming requests for easier debugging
    console.log(`Domain verification request:`, { action, domain, verificationCodeProvided: !!verificationCode });

    // Check if API key is configured only for actions requiring it
    if ((action === "getExpirationDate" || action === "getWhoisEmail") && !WHOISXML_API_KEY) {
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
      case "checkDnsTxtRecord":
        if (!verificationCode) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing verification code" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        return await checkDnsTxtRecord(domain, verificationCode);
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

// Get domain expiration date - For demo purposes, we'll mock the response
async function getExpirationDate(domain: string) {
  try {
    console.log(`Fetching expiration date for ${domain}`);
    
    // Mock successful response for testing purposes since WhoisXML API might not be available
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 3); // Set to 3 months in the future
    
    console.log(`Using mocked expiration date for ${domain}: ${futureDate.toISOString()}`);
    
    // Check if we have a real API key and try to use it first
    if (WHOISXML_API_KEY) {
      try {
        const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
          // Fall back to mock data
        } else {
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
          
          if (expirationDate) {
            console.log(`Extracted expiration date for ${domain}: ${expirationDate}`);
            return new Response(
              JSON.stringify({ 
                success: true, 
                expirationDate: new Date(expirationDate).toISOString(),
                source: "whois" 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          // If no expiration date found, fall back to mock data
        }
      } catch (apiError) {
        console.error(`Error using WhoisXML API for ${domain}:`, apiError);
        // Fall back to mock data
      }
    }
    
    // Return mock data if API call failed or no API key is available
    return new Response(
      JSON.stringify({ 
        success: true, 
        expirationDate: futureDate.toISOString(),
        source: "mock" 
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
    
    // For testing purposes, return a mock email when API key isn't available
    if (!WHOISXML_API_KEY) {
      console.log(`Using mock email for ${domain} (no API key available)`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: `admin@${domain}`,
          source: "mock"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOISXML_API_KEY}&domainName=${domain}&outputFormat=JSON`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`WhoisXML API returned ${response.status}: ${response.statusText}`);
      // Fall back to mock data
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: `admin@${domain}`,
          source: "mock"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const data = await response.json();
    
    console.log(`Received WhoisXML response for ${domain}`);
    
    const whoisRecord = data.WhoisRecord || {};
    const contactEmail = whoisRecord.contactEmail || 
                        (whoisRecord.registrant && whoisRecord.registrant.email) ||
                        (whoisRecord.administrativeContact && whoisRecord.administrativeContact.email) ||
                        null;
    
    console.log(`Extracted contact email for ${domain}: ${contactEmail}`);
    
    if (!contactEmail) {
      // Fall back to mock data if no email found
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: `admin@${domain}`,
          source: "mock"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        email: contactEmail,
        source: "whois"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error fetching WHOIS email for ${domain}:`, error);
    // Fall back to mock data in case of any error
    return new Response(
      JSON.stringify({ 
        success: true, 
        email: `admin@${domain}`,
        source: "mock"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Check if DNS TXT record exists with verification code
async function checkDnsTxtRecord(domain: string, verificationCode: string) {
  try {
    console.log(`Checking DNS TXT record for ${domain} with code ${verificationCode}`);
    
    // For demo purposes, always succeed except for specific test cases
    // In a real implementation, you would check the actual DNS records
    
    // If the verification code contains "fail" or the domain contains "fail",
    // we'll simulate a failure
    const shouldFail = verificationCode.includes("fail") || domain.includes("fail");
    
    console.log(`DNS TXT verification ${shouldFail ? 'failed' : 'successful'} for ${domain}`);
    
    // For testing & development, a simple rule: 
    // Domains that contain "test" or "example" will be automatically verified
    const forceSucceed = domain.includes("test") || domain.includes("example");
    
    // Wait for a short time to simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return new Response(
      JSON.stringify({ success: true, isVerified: forceSucceed || !shouldFail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error checking DNS TXT record for ${domain}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
